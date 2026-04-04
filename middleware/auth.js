const {
  User,
  Formateur,
  Formation,
  Session,
  Inscription,
  Presence,
  Avis,
} = require('../models');

const TABLE_LINKS = [
  { key: 'users', href: '/users', label: 'Utilisateurs', roles: ['admin'] },
  { key: 'formateurs', href: '/formateurs', label: 'Formateurs', roles: ['admin', 'formateur'] },
  { key: 'formations', href: '/formations', label: 'Formations', roles: ['admin', 'formateur', 'apprenant'] },
  { key: 'sessions', href: '/sessions', label: 'Sessions', roles: ['admin', 'formateur', 'apprenant'] },
  { key: 'inscriptions', href: '/inscriptions', label: 'Inscriptions', roles: ['admin', 'formateur', 'apprenant'] },
  { key: 'presences', href: '/presences', label: 'Presences', roles: ['admin', 'formateur', 'apprenant'] },
  { key: 'avis', href: '/avis', label: 'Avis', roles: ['admin', 'formateur', 'apprenant'] },
];

function getFormateurId(user) {
  return user && user.profilFormateur ? user.profilFormateur.id : -1;
}

function getVisibleTableLinks(user) {
  if (!user) {
    return [];
  }

  return TABLE_LINKS
    .filter((link) => link.roles.includes(user.role))
    .map(({ key, href, label }) => ({ key, href, label }));
}

function canAccessTable(user, tableKey) {
  if (!user) {
    return false;
  }

  return TABLE_LINKS.some((link) => link.key === tableKey && link.roles.includes(user.role));
}

function sendUnauthorized(req, res) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({
      message: 'Authentification requise.',
    });
  }

  return res.redirect('/login');
}

function sendForbidden(req, res) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(403).json({
      message: 'Acces refuse pour ce role.',
    });
  }

  return res.redirect('/');
}

async function loadCurrentUser(req, res, next) {
  const userId = Number.parseInt(req.cookies.auth_user_id, 10);
  let currentUser = null;

  if (Number.isInteger(userId) && userId > 0) {
    try {
      currentUser = await User.findByPk(userId, {
        include: [{ model: Formateur, as: 'profilFormateur' }],
      });
    } catch (error) {
      return next(error);
    }
  }

  req.currentUser = currentUser;
  res.locals.currentUser = currentUser;
  res.locals.currentPath = req.path;
  res.locals.tableLinks = getVisibleTableLinks(currentUser);

  return next();
}

function requireAuth(req, res, next) {
  if (!req.currentUser) {
    return sendUnauthorized(req, res);
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.currentUser) {
    return sendUnauthorized(req, res);
  }

  if (req.currentUser.role !== 'admin') {
    return sendForbidden(req, res);
  }

  return next();
}

function buildTableQuery(tableKey, user) {
  const formateurId = getFormateurId(user);

  switch (tableKey) {
    case 'users':
      return {
        include: [{ model: Formateur, as: 'profilFormateur' }],
        order: [['id', 'ASC']],
        distinct: true,
      };
    case 'formateurs':
      return {
        where: user.role === 'formateur' ? { user_id: user.id } : undefined,
        include: [{ model: User, as: 'user' }],
        order: [['id', 'ASC']],
        distinct: true,
      };
    case 'formations':
      return {
        order: [['id', 'ASC']],
        distinct: true,
      };
    case 'sessions':
      return {
        where: user.role === 'formateur' ? { formateur_id: formateurId } : undefined,
        include: [
          { model: Formation, as: 'formation' },
          {
            model: Formateur,
            as: 'formateur',
            include: [{ model: User, as: 'user' }],
          },
        ],
        order: [['date_debut', 'ASC']],
        distinct: true,
      };
    case 'inscriptions':
      return {
        where: user.role === 'apprenant' ? { user_id: user.id } : undefined,
        include: [
          { model: User, as: 'user' },
          {
            model: Session,
            as: 'session',
            where: user.role === 'formateur' ? { formateur_id: formateurId } : undefined,
            required: user.role === 'formateur',
            include: [{ model: Formation, as: 'formation' }],
          },
        ],
        order: [['date_inscription', 'DESC']],
        distinct: true,
      };
    case 'presences':
      return {
        include: [
          {
            model: Inscription,
            as: 'inscription',
            where: user.role === 'apprenant' ? { user_id: user.id } : undefined,
            required: user.role === 'apprenant',
            include: [
              { model: User, as: 'user' },
              {
                model: Session,
                as: 'session',
                where: user.role === 'formateur' ? { formateur_id: formateurId } : undefined,
                required: user.role === 'formateur',
                include: [{ model: Formation, as: 'formation' }],
              },
            ],
          },
        ],
        order: [['date', 'DESC']],
        distinct: true,
      };
    case 'avis':
      return {
        where: user.role === 'apprenant' ? { user_id: user.id } : undefined,
        include: [
          { model: User, as: 'user' },
          { model: Formation, as: 'formation' },
        ],
        order: [['date', 'DESC']],
        distinct: true,
      };
    default:
      return {};
  }
}

async function getHomeStats(user) {
  if (!user) {
    return [];
  }

  if (user.role === 'admin') {
    const [users, formateurs, formations, sessions, inscriptions, presences, avis] = await Promise.all([
      User.count(),
      Formateur.count(),
      Formation.count(),
      Session.count(),
      Inscription.count(),
      Presence.count(),
      Avis.count(),
    ]);

    return [
      { label: 'Utilisateurs', value: users },
      { label: 'Formateurs', value: formateurs },
      { label: 'Formations', value: formations },
      { label: 'Sessions', value: sessions },
      { label: 'Inscriptions', value: inscriptions },
      { label: 'Presences', value: presences },
      { label: 'Avis', value: avis },
    ];
  }

  if (user.role === 'formateur') {
    const formateurId = getFormateurId(user);
    const [profil, formations, sessions, inscriptions, presences, avis] = await Promise.all([
      Formateur.count({ where: { user_id: user.id } }),
      Formation.count(),
      Session.count({ where: { formateur_id: formateurId } }),
      Inscription.count({
        include: [
          {
            model: Session,
            as: 'session',
            where: { formateur_id: formateurId },
            required: true,
          },
        ],
        distinct: true,
      }),
      Presence.count({
        include: [
          {
            model: Inscription,
            as: 'inscription',
            required: true,
            include: [
              {
                model: Session,
                as: 'session',
                where: { formateur_id: formateurId },
                required: true,
              },
            ],
          },
        ],
        distinct: true,
      }),
      Avis.count(),
    ]);

    return [
      { label: 'Mon profil', value: profil },
      { label: 'Formations', value: formations },
      { label: 'Mes sessions', value: sessions },
      { label: 'Inscriptions', value: inscriptions },
      { label: 'Presences', value: presences },
      { label: 'Avis', value: avis },
    ];
  }

  const [formations, sessions, inscriptions, presences, avis] = await Promise.all([
    Formation.count(),
    Session.count(),
    Inscription.count({ where: { user_id: user.id } }),
    Presence.count({
      include: [
        {
          model: Inscription,
          as: 'inscription',
          where: { user_id: user.id },
          required: true,
        },
      ],
      distinct: true,
    }),
    Avis.count({ where: { user_id: user.id } }),
  ]);

  return [
    { label: 'Formations', value: formations },
    { label: 'Sessions', value: sessions },
    { label: 'Mes inscriptions', value: inscriptions },
    { label: 'Mes presences', value: presences },
    { label: 'Mes avis', value: avis },
  ];
}

module.exports = {
  buildTableQuery,
  canAccessTable,
  getHomeStats,
  getVisibleTableLinks,
  loadCurrentUser,
  requireAdmin,
  requireAuth,
};
