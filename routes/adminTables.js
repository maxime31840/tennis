const {
  User,
  Formateur,
  Formation,
  Session,
  Inscription,
  Presence,
  Avis,
} = require('../models');
const { buildTableQuery, canAccessTable } = require('../middleware/auth');
const { parseId, formatSequelizeError } = require('./helpers');

const PAGE_SIZE = 5;
const TABLE_ROUTE_PATTERN = ':table(users|formateurs|formations|sessions|inscriptions|presences|avis)';

const CRUD_RULES = {
  admin: {
    users: { create: true, edit: true, delete: true },
    formateurs: { create: true, edit: true, delete: true },
    formations: { create: true, edit: true, delete: true },
    sessions: { create: true, edit: true, delete: true },
    inscriptions: { create: true, edit: true, delete: true },
    presences: { create: true, edit: true, delete: true },
    avis: { create: true, edit: true, delete: true },
  },
  formateur: {
    formations: { create: false, edit: true, delete: true },
    sessions: {
      create: (user) => Boolean(getFormateurId(user)),
      edit: true,
      delete: true,
    },
  },
  apprenant: {
    inscriptions: { create: true, edit: false, delete: true },
    avis: { create: true, edit: false, delete: false },
  },
};

function getFormateurId(user) {
  return user && user.profilFormateur ? user.profilFormateur.id : null;
}

function formatDate(value, withTime = false) {
  if (!value) {
    return '';
  }

  const options = withTime
    ? { dateStyle: 'short', timeStyle: 'short' }
    : { dateStyle: 'short' };

  return new Date(value).toLocaleString('fr-FR', options);
}

function formatDateTimeInput(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parsePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getPageNumbers(currentPage, totalPages) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const pageNumbers = [];

  for (let page = start; page <= end; page += 1) {
    pageNumbers.push(page);
  }

  return pageNumbers;
}

function normalizeTrimmed(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalText(value) {
  const normalized = normalizeTrimmed(value);
  return normalized === '' ? null : normalized;
}

function normalizeOptionalDateTime(value) {
  const normalized = normalizeTrimmed(value);
  return normalized === '' ? undefined : normalized;
}

function buildHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function compactPayload(payload) {
  return Object.entries(payload).reduce((accumulator, [key, value]) => {
    if (value !== undefined) {
      accumulator[key] = value;
    }

    return accumulator;
  }, {});
}

function formatStatusMessage(status, singular) {
  switch (status) {
    case 'created':
      return `${singular} cree avec succes.`;
    case 'updated':
      return `${singular} mis a jour avec succes.`;
    case 'deleted':
      return `${singular} supprime avec succes.`;
    default:
      return null;
  }
}

function getCreateFormMeta(user, tableKey, singular) {
  if (user.role === 'apprenant' && tableKey === 'inscriptions') {
    return {
      title: 'S inscrire a une session',
      submitLabel: 'S inscrire',
    };
  }

  return {
    title: `Ajouter ${singular.toLowerCase()}`,
    submitLabel: 'Creer',
  };
}

function toOption(value, label) {
  return {
    value: String(value),
    label,
  };
}

function getFieldValue(source, name, type) {
  if (!source || !Object.prototype.hasOwnProperty.call(source, name) || source[name] == null) {
    return '';
  }

  const value = source[name];
  if (type === 'datetime-local') {
    return formatDateTimeInput(value);
  }

  return String(value);
}

function resolvePermission(flag, user) {
  return typeof flag === 'function' ? flag(user) : Boolean(flag);
}

function getCrudPermissions(user, tableKey) {
  if (!user) {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
    };
  }

  const rule = (CRUD_RULES[user.role] && CRUD_RULES[user.role][tableKey]) || {};

  return {
    canCreate: resolvePermission(rule.create, user),
    canEdit: resolvePermission(rule.edit, user),
    canDelete: resolvePermission(rule.delete, user),
  };
}

function assertTablePermission(user, tableKey, action) {
  const permissions = getCrudPermissions(user, tableKey);
  const isAllowed = {
    create: permissions.canCreate,
    edit: permissions.canEdit,
    delete: permissions.canDelete,
  }[action];

  if (!isAllowed) {
    throw buildHttpError(403, 'Acces refuse pour cette action.');
  }

  return permissions;
}

const tablePages = {
  users: {
    model: User,
    singular: 'Utilisateur',
    title: 'Utilisateurs',
    description: 'Liste des comptes de la plateforme avec leur role metier et leur eventuel profil formateur.',
    columns: ['ID', 'Nom', 'Prenom', 'Email', 'Role', 'Specialite'],
    mapRow: (user) => [
      user.id,
      user.nom,
      user.prenom,
      user.email,
      user.role,
      user.profilFormateur ? user.profilFormateur.specialite || '-' : '-',
    ],
  },
  formateurs: {
    model: Formateur,
    singular: 'Formateur',
    title: 'Formateurs',
    description: 'Vue des formateurs relies a leur compte utilisateur, utile pour le pilotage des sessions.',
    columns: ['ID', 'Utilisateur', 'Email', 'Specialite'],
    mapRow: (formateur) => [
      formateur.id,
      formateur.user ? `${formateur.user.prenom} ${formateur.user.nom}` : '-',
      formateur.user ? formateur.user.email : '-',
      formateur.specialite || '-',
    ],
  },
  formations: {
    model: Formation,
    singular: 'Formation',
    title: 'Formations',
    description: 'Catalogue des formations tennis proposees par le centre.',
    columns: ['ID', 'Titre', 'Description'],
    mapRow: (formation) => [formation.id, formation.titre, formation.description || '-'],
  },
  sessions: {
    model: Session,
    singular: 'Session',
    title: 'Sessions',
    description: 'Planning des sessions rattachees a une formation et a un formateur.',
    columns: ['ID', 'Formation', 'Formateur', 'Debut', 'Fin', 'Lieu'],
    mapRow: (session) => [
      session.id,
      session.formation ? session.formation.titre : '-',
      session.formateur && session.formateur.user
        ? `${session.formateur.user.prenom} ${session.formateur.user.nom}`
        : '-',
      formatDate(session.date_debut, true),
      formatDate(session.date_fin, true),
      session.lieu,
    ],
  },
  inscriptions: {
    model: Inscription,
    singular: 'Inscription',
    title: 'Inscriptions',
    description: 'Suivi des apprenants inscrits a chaque session de formation.',
    columns: ['ID', 'Apprenant', 'Formation', 'Session', 'Date inscription'],
    mapRow: (inscription) => [
      inscription.id,
      inscription.user ? `${inscription.user.prenom} ${inscription.user.nom}` : '-',
      inscription.session && inscription.session.formation ? inscription.session.formation.titre : '-',
      inscription.session ? formatDate(inscription.session.date_debut, true) : '-',
      formatDate(inscription.date_inscription, true),
    ],
  },
  presences: {
    model: Presence,
    singular: 'Presence',
    title: 'Presences',
    description: 'Etat de presence des apprenants inscrits aux sessions tennis.',
    columns: ['ID', 'Apprenant', 'Formation', 'Statut', 'Date'],
    mapRow: (presence) => [
      presence.id,
      presence.inscription && presence.inscription.user
        ? `${presence.inscription.user.prenom} ${presence.inscription.user.nom}`
        : '-',
      presence.inscription && presence.inscription.session && presence.inscription.session.formation
        ? presence.inscription.session.formation.titre
        : '-',
      presence.statut,
      formatDate(presence.date, true),
    ],
  },
  avis: {
    model: Avis,
    singular: 'Avis',
    title: 'Avis',
    description: 'Retours et notes laisses par les apprenants sur les formations.',
    columns: ['ID', 'Apprenant', 'Formation', 'Note', 'Commentaire', 'Date'],
    mapRow: (avis) => [
      avis.id,
      avis.user ? `${avis.user.prenom} ${avis.user.nom}` : '-',
      avis.formation ? avis.formation.titre : '-',
      `${avis.note}/5`,
      avis.commentaire || '-',
      formatDate(avis.date, true),
    ],
  },
};

function buildCrudPayload(tableKey, body, mode) {
  switch (tableKey) {
    case 'users': {
      const password = normalizeTrimmed(body.password);
      return compactPayload({
        nom: normalizeTrimmed(body.nom),
        prenom: normalizeTrimmed(body.prenom),
        email: normalizeTrimmed(body.email),
        role: normalizeTrimmed(body.role),
        password: mode === 'create' || password !== '' ? password : undefined,
      });
    }
    case 'formateurs':
      return compactPayload({
        user_id: parseId(body.user_id),
        specialite: normalizeOptionalText(body.specialite),
      });
    case 'formations':
      return compactPayload({
        titre: normalizeTrimmed(body.titre),
        description: normalizeOptionalText(body.description),
      });
    case 'sessions':
      return compactPayload({
        formation_id: parseId(body.formation_id),
        formateur_id: parseId(body.formateur_id),
        date_debut: normalizeTrimmed(body.date_debut),
        date_fin: normalizeTrimmed(body.date_fin),
        lieu: normalizeTrimmed(body.lieu),
      });
    case 'inscriptions':
      return compactPayload({
        user_id: parseId(body.user_id),
        session_id: parseId(body.session_id),
        date_inscription: normalizeOptionalDateTime(body.date_inscription),
      });
    case 'presences':
      return compactPayload({
        inscription_id: parseId(body.inscription_id),
        statut: normalizeTrimmed(body.statut),
        date: normalizeOptionalDateTime(body.date),
      });
    case 'avis':
      return compactPayload({
        user_id: parseId(body.user_id),
        formation_id: parseId(body.formation_id),
        note: body.note === '' ? undefined : Number.parseInt(body.note, 10),
        commentaire: normalizeOptionalText(body.commentaire),
        date: normalizeOptionalDateTime(body.date),
      });
    default:
      return {};
  }
}

function applyRoleConstraints(tableKey, payload, user) {
  if (user.role === 'formateur') {
    if (tableKey === 'sessions') {
      return {
        ...payload,
        formateur_id: getFormateurId(user),
      };
    }
  }

  if (user.role === 'apprenant' && ['inscriptions', 'avis'].includes(tableKey)) {
    return {
      ...payload,
      user_id: user.id,
    };
  }

  return payload;
}

async function canMutateRecord(user, tableKey, record) {
  if (!record) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'formateur') {
    const formateurId = getFormateurId(user);

    if (tableKey === 'sessions') {
      return record.formateur_id === formateurId;
    }

    if (tableKey === 'formations') {
      const [totalSessions, ownSessions] = await Promise.all([
        Session.count({
          where: {
            formation_id: record.id,
          },
        }),
        Session.count({
          where: {
            formation_id: record.id,
            formateur_id: formateurId,
          },
        }),
      ]);

      return totalSessions > 0 && totalSessions === ownSessions;
    }

    return false;
  }

  if (user.role === 'apprenant') {
    return tableKey === 'inscriptions' && record.user_id === user.id;
  }

  return false;
}

async function findRecordForMutation(tableKey, id, user) {
  const pageConfig = tablePages[tableKey];
  const record = await pageConfig.model.findByPk(id);

  if (!record) {
    throw buildHttpError(404, `${pageConfig.singular} introuvable.`);
  }

  if (!(await canMutateRecord(user, tableKey, record))) {
    throw buildHttpError(403, 'Acces refuse pour cet enregistrement.');
  }

  return record;
}

async function validateCrudPayload(tableKey, payload, user) {
  switch (tableKey) {
    case 'formateurs': {
      if (!payload.user_id) {
        return;
      }

      const targetUser = await User.findByPk(payload.user_id);
      if (!targetUser) {
        throw buildHttpError(404, 'Utilisateur associe introuvable.');
      }

      if (targetUser.role !== 'formateur') {
        throw buildHttpError(400, "L'utilisateur doit avoir le role formateur.");
      }
      return;
    }
    case 'sessions': {
      const [formation, formateur] = await Promise.all([
        payload.formation_id ? Formation.findByPk(payload.formation_id) : null,
        payload.formateur_id ? Formateur.findByPk(payload.formateur_id) : null,
      ]);

      if (payload.formation_id && !formation) {
        throw buildHttpError(404, 'Formation associee introuvable.');
      }

      if (payload.formateur_id && !formateur) {
        throw buildHttpError(404, 'Formateur associe introuvable.');
      }

      if (user.role === 'formateur' && payload.formateur_id !== getFormateurId(user)) {
        throw buildHttpError(403, 'Vous ne pouvez gerer que vos propres sessions.');
      }
      return;
    }
    case 'inscriptions': {
      const [targetUser, session] = await Promise.all([
        payload.user_id ? User.findByPk(payload.user_id) : null,
        payload.session_id ? Session.findByPk(payload.session_id) : null,
      ]);

      if (payload.user_id && !targetUser) {
        throw buildHttpError(404, 'Utilisateur introuvable.');
      }

      if (payload.session_id && !session) {
        throw buildHttpError(404, 'Session introuvable.');
      }

      if (user.role === 'apprenant' && payload.user_id !== user.id) {
        throw buildHttpError(403, 'Vous ne pouvez gerer que vos propres inscriptions.');
      }

      if (user.role === 'formateur') {
        if (!session || session.formateur_id !== getFormateurId(user)) {
          throw buildHttpError(403, 'Vous ne pouvez gerer que les inscriptions de vos sessions.');
        }

        if (targetUser && targetUser.role !== 'apprenant') {
          throw buildHttpError(400, 'Une inscription doit etre rattachee a un apprenant.');
        }
      }
      return;
    }
    case 'presences': {
      if (!payload.inscription_id) {
        return;
      }

      const inscription = await Inscription.findByPk(payload.inscription_id, {
        include: [{ model: Session, as: 'session' }],
      });

      if (!inscription) {
        throw buildHttpError(404, 'Inscription associee introuvable.');
      }

      if (
        user.role === 'formateur'
        && (!inscription.session || inscription.session.formateur_id !== getFormateurId(user))
      ) {
        throw buildHttpError(403, 'Vous ne pouvez gerer que les presences de vos sessions.');
      }
      return;
    }
    case 'avis': {
      const [targetUser, formation] = await Promise.all([
        payload.user_id ? User.findByPk(payload.user_id) : null,
        payload.formation_id ? Formation.findByPk(payload.formation_id) : null,
      ]);

      if (payload.user_id && !targetUser) {
        throw buildHttpError(404, 'Utilisateur introuvable.');
      }

      if (payload.formation_id && !formation) {
        throw buildHttpError(404, 'Formation introuvable.');
      }

      if (user.role === 'apprenant' && payload.user_id !== user.id) {
        throw buildHttpError(403, 'Vous ne pouvez gerer que vos propres avis.');
      }
      return;
    }
    default:
      return;
  }
}

async function loadFormOptions(tableKey, user) {
  switch (tableKey) {
    case 'formateurs': {
      if (user.role !== 'admin') {
        return {};
      }

      const users = await User.findAll({
        where: { role: 'formateur' },
        order: [['prenom', 'ASC'], ['nom', 'ASC']],
      });

      return {
        user_id: users.map((targetUser) => toOption(
          targetUser.id,
          `${targetUser.prenom} ${targetUser.nom} (${targetUser.email})`
        )),
      };
    }
    case 'sessions': {
      const [formations, formateurs] = await Promise.all([
        Formation.findAll({
          order: [['titre', 'ASC']],
        }),
        user.role === 'admin'
          ? Formateur.findAll({
              include: [{ model: User, as: 'user' }],
              order: [['id', 'ASC']],
            })
          : Promise.resolve([]),
      ]);

      return {
        formation_id: formations.map((formation) => toOption(formation.id, formation.titre)),
        formateur_id: formateurs.map((formateur) => {
          const label = formateur.user
            ? `${formateur.user.prenom} ${formateur.user.nom}${formateur.specialite ? ` - ${formateur.specialite}` : ''}`
            : `Formateur #${formateur.id}`;

          return toOption(formateur.id, label);
        }),
      };
    }
    case 'inscriptions': {
      const [users, sessions] = await Promise.all([
        user.role === 'apprenant'
          ? Promise.resolve([])
          : User.findAll({
              where: user.role === 'formateur' ? { role: 'apprenant' } : undefined,
              order: [['prenom', 'ASC'], ['nom', 'ASC']],
            }),
        Session.findAll({
          where: user.role === 'formateur' ? { formateur_id: getFormateurId(user) } : undefined,
          include: [{ model: Formation, as: 'formation' }],
          order: [['date_debut', 'ASC']],
        }),
      ]);

      return {
        user_id: users.map((targetUser) => toOption(
          targetUser.id,
          `${targetUser.prenom} ${targetUser.nom} (${targetUser.role})`
        )),
        session_id: sessions.map((session) => {
          const formationLabel = session.formation ? session.formation.titre : `Session #${session.id}`;
          return toOption(session.id, `${formationLabel} | ${formatDate(session.date_debut, true)} | ${session.lieu}`);
        }),
      };
    }
    case 'presences': {
      const inscriptions = await Inscription.findAll({
        include: [
          { model: User, as: 'user' },
          {
            model: Session,
            as: 'session',
            where: user.role === 'formateur' ? { formateur_id: getFormateurId(user) } : undefined,
            required: user.role === 'formateur',
            include: [{ model: Formation, as: 'formation' }],
          },
        ],
        order: [['id', 'ASC']],
      });

      return {
        inscription_id: inscriptions.map((inscription) => {
          const userLabel = inscription.user
            ? `${inscription.user.prenom} ${inscription.user.nom}`
            : `Inscription #${inscription.id}`;
          const formationLabel = inscription.session && inscription.session.formation
            ? inscription.session.formation.titre
            : 'Session';

          return toOption(inscription.id, `#${inscription.id} - ${userLabel} - ${formationLabel}`);
        }),
      };
    }
    case 'avis': {
      const [users, formations] = await Promise.all([
        user.role === 'admin'
          ? User.findAll({
              order: [['prenom', 'ASC'], ['nom', 'ASC']],
            })
          : Promise.resolve([]),
        Formation.findAll({
          order: [['titre', 'ASC']],
        }),
      ]);

      return {
        user_id: users.map((targetUser) => toOption(
          targetUser.id,
          `${targetUser.prenom} ${targetUser.nom} (${targetUser.role})`
        )),
        formation_id: formations.map((formation) => toOption(formation.id, formation.titre)),
      };
    }
    default:
      return {};
  }
}

async function buildCrudForm(tableKey, mode, source, action, submitLabel, title, user) {
  const optionsByField = await loadFormOptions(tableKey, user);

  const field = (name, label, type, extra = {}) => ({
    name,
    label,
    type,
    value: getFieldValue(source, name, type),
    ...extra,
  });

  switch (tableKey) {
    case 'users':
      if (user.role !== 'admin') {
        return null;
      }

      return {
        title,
        action,
        submitLabel,
        fields: [
          field('nom', 'Nom', 'text', { required: true }),
          field('prenom', 'Prenom', 'text', { required: true }),
          field('email', 'Email', 'email', { required: true }),
          {
            name: 'password',
            label: 'Mot de passe',
            type: 'password',
            required: mode === 'create',
            value: '',
            hint: mode === 'edit' ? 'Laisser vide pour conserver le mot de passe actuel.' : null,
          },
          field('role', 'Role', 'select', {
            required: true,
            options: [
              toOption('admin', 'admin'),
              toOption('formateur', 'formateur'),
              toOption('apprenant', 'apprenant'),
            ],
          }),
        ],
      };
    case 'formateurs':
      if (user.role !== 'admin') {
        return null;
      }

      return {
        title,
        action,
        submitLabel,
        fields: [
          field('user_id', 'Utilisateur', 'select', {
            required: true,
            options: optionsByField.user_id || [],
          }),
          field('specialite', 'Specialite', 'text'),
        ],
      };
    case 'formations':
      if (!['admin', 'formateur'].includes(user.role)) {
        return null;
      }

      return {
        title,
        action,
        submitLabel,
        fields: [
          field('titre', 'Titre', 'text', { required: true }),
          field('description', 'Description', 'textarea'),
        ],
      };
    case 'sessions':
      return {
        title,
        action,
        submitLabel,
        fields: user.role === 'admin'
          ? [
              field('formation_id', 'Formation', 'select', {
                required: true,
                options: optionsByField.formation_id || [],
              }),
              field('formateur_id', 'Formateur', 'select', {
                required: true,
                options: optionsByField.formateur_id || [],
              }),
              field('date_debut', 'Date de debut', 'datetime-local', { required: true }),
              field('date_fin', 'Date de fin', 'datetime-local', { required: true }),
              field('lieu', 'Lieu', 'text', { required: true }),
            ]
          : [
              field('formation_id', 'Formation', 'select', {
                required: true,
                options: optionsByField.formation_id || [],
              }),
              field('date_debut', 'Date de debut', 'datetime-local', { required: true }),
              field('date_fin', 'Date de fin', 'datetime-local', { required: true }),
              field('lieu', 'Lieu', 'text', { required: true }),
            ],
      };
    case 'inscriptions':
      if (!['admin', 'apprenant'].includes(user.role)) {
        return null;
      }

      return {
        title,
        action,
        submitLabel,
        fields: [
          ...(user.role === 'admin'
            ? [
                field('user_id', 'Utilisateur', 'select', {
                  required: true,
                  options: optionsByField.user_id || [],
                }),
              ]
            : []),
          field('session_id', 'Session', 'select', {
            required: true,
            options: optionsByField.session_id || [],
          }),
          ...(user.role === 'admin'
            ? [field('date_inscription', 'Date inscription', 'datetime-local')]
            : []),
        ],
      };
    case 'presences':
      if (user.role !== 'admin') {
        return null;
      }

      return {
        title,
        action,
        submitLabel,
        fields: [
          field('inscription_id', 'Inscription', 'select', {
            required: true,
            options: optionsByField.inscription_id || [],
          }),
          field('statut', 'Statut', 'select', {
            required: true,
            options: [
              toOption('present', 'present'),
              toOption('absent', 'absent'),
            ],
          }),
          field('date', 'Date', 'datetime-local'),
        ],
      };
    case 'avis':
      if (!['admin', 'apprenant'].includes(user.role)) {
        return null;
      }

      return {
        title,
        action,
        submitLabel,
        fields: [
          ...(user.role === 'admin'
            ? [
                field('user_id', 'Utilisateur', 'select', {
                  required: true,
                  options: optionsByField.user_id || [],
                }),
              ]
            : []),
          field('formation_id', 'Formation', 'select', {
            required: true,
            options: optionsByField.formation_id || [],
          }),
          field('note', 'Note', 'number', { required: true, min: 1, max: 5 }),
          field('commentaire', 'Commentaire', 'textarea'),
          field('date', 'Date', 'datetime-local'),
        ],
      };
    default:
      return null;
  }
}

async function renderTablePage(req, res, options = {}) {
  if (!req.currentUser) {
    return res.redirect('/login');
  }

  const tableKey = req.params.table;
  if (!canAccessTable(req.currentUser, tableKey)) {
    return res.redirect('/');
  }

  const pageConfig = tablePages[tableKey];
  const permissions = getCrudPermissions(req.currentUser, tableKey);
  const requestedPage = parsePage(options.page ?? req.query.page);
  const basePath = `/${tableKey}`;
  const skipRedirect = options.skipRedirect ?? false;

  try {
    let countResult = await pageConfig.model.findAndCountAll({
      ...buildTableQuery(tableKey, req.currentUser),
      limit: PAGE_SIZE,
      offset: (requestedPage - 1) * PAGE_SIZE,
    });

    const totalItems = typeof countResult.count === 'number' ? countResult.count : countResult.count.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const currentPage = Math.min(requestedPage, totalPages);

    if (!skipRedirect && currentPage !== requestedPage) {
      return res.redirect(`${basePath}?page=${currentPage}`);
    }

    if (skipRedirect && currentPage !== requestedPage) {
      countResult = await pageConfig.model.findAndCountAll({
        ...buildTableQuery(tableKey, req.currentUser),
        limit: PAGE_SIZE,
        offset: (currentPage - 1) * PAGE_SIZE,
      });
    }

    let errorMessage = options.errorMessage || null;
    const activeEditId = permissions.canEdit
      ? (options.editId !== undefined ? options.editId : parseId(req.query.edit))
      : null;

    let createForm = null;
    let editForm = null;

    if (permissions.canCreate) {
      const createMeta = getCreateFormMeta(req.currentUser, tableKey, pageConfig.singular);
      createForm = await buildCrudForm(
        tableKey,
        'create',
        options.createValues || {},
        `${basePath}/create`,
        createMeta.submitLabel,
        createMeta.title,
        req.currentUser
      );
    }

    if (activeEditId && permissions.canEdit) {
      try {
        const editRecord = options.editValues
          ? options.editValues
          : await findRecordForMutation(tableKey, activeEditId, req.currentUser);
        const editSource = typeof editRecord.get === 'function'
          ? editRecord.get({ plain: true })
          : editRecord;

        editForm = await buildCrudForm(
          tableKey,
          'edit',
          editSource,
          `${basePath}/${activeEditId}/update`,
          'Mettre a jour',
          `Modifier ${pageConfig.singular.toLowerCase()} #${activeEditId}`,
          req.currentUser
        );

        if (editForm) {
          editForm.cancelHref = `${basePath}?page=${currentPage}`;
        }
      } catch (error) {
        errorMessage = errorMessage || error.message;
      }
    }

    const rows = await Promise.all(countResult.rows.map(async (record) => {
      const canMutate = (permissions.canEdit || permissions.canDelete)
        ? await canMutateRecord(req.currentUser, tableKey, record)
        : false;

      return {
        id: record.id,
        cells: pageConfig.mapRow(record),
        editUrl: permissions.canEdit && canMutate ? `${basePath}?page=${currentPage}&edit=${record.id}` : null,
        deleteAction: permissions.canDelete && canMutate ? `${basePath}/${record.id}/delete` : null,
        isEditing: activeEditId === record.id,
      };
    }));

    const hasRowActions = rows.some((row) => row.editUrl || row.deleteAction);

    return res.status(options.statusCode || 200).render('table', {
      title: pageConfig.title,
      tableLabel: pageConfig.title,
      description: pageConfig.description,
      columns: pageConfig.columns,
      rows,
      currentPage,
      totalPages,
      totalItems,
      basePath,
      currentPath: basePath,
      previousPageUrl: currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : null,
      nextPageUrl: currentPage < totalPages ? `${basePath}?page=${currentPage + 1}` : null,
      pageNumbers: getPageNumbers(currentPage, totalPages),
      statusMessage: options.statusMessage || formatStatusMessage(req.query.status, pageConfig.singular),
      errorMessage,
      crudConfig: (createForm || editForm || hasRowActions)
        ? {
            createForm,
            editForm,
            hasRowActions,
          }
        : null,
    });
  } catch (error) {
    return res.status(500).render('table', {
      title: pageConfig.title,
      tableLabel: pageConfig.title,
      description: `${pageConfig.description} Impossible de charger les donnees: ${error.message}`,
      columns: pageConfig.columns,
      rows: [],
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      basePath,
      currentPath: basePath,
      previousPageUrl: null,
      nextPageUrl: null,
      pageNumbers: [1],
      statusMessage: null,
      errorMessage: options.errorMessage || null,
      crudConfig: null,
    });
  }
}

async function handleCreate(req, res) {
  const tableKey = req.params.table;
  const page = parsePage(req.body.page);
  const pageConfig = tablePages[tableKey];

  try {
    assertTablePermission(req.currentUser, tableKey, 'create');

    const payload = applyRoleConstraints(
      tableKey,
      buildCrudPayload(tableKey, req.body, 'create'),
      req.currentUser
    );

    await validateCrudPayload(tableKey, payload, req.currentUser);
    await pageConfig.model.create(payload);

    return res.redirect(`/${tableKey}?page=${page}&status=created`);
  } catch (error) {
    return renderTablePage(req, res, {
      page,
      skipRedirect: true,
      statusCode: error.statusCode || 400,
      errorMessage: error.statusCode ? error.message : formatSequelizeError(error),
      createValues: req.body,
    });
  }
}

async function handleUpdate(req, res) {
  const tableKey = req.params.table;
  const page = parsePage(req.body.page);
  const id = parseId(req.params.id);
  const pageConfig = tablePages[tableKey];

  if (!id) {
    return renderTablePage(req, res, {
      page,
      skipRedirect: true,
      statusCode: 400,
      errorMessage: `Identifiant ${pageConfig.singular.toLowerCase()} invalide.`,
    });
  }

  try {
    assertTablePermission(req.currentUser, tableKey, 'edit');

    const record = await findRecordForMutation(tableKey, id, req.currentUser);
    const payload = applyRoleConstraints(
      tableKey,
      buildCrudPayload(tableKey, req.body, 'edit'),
      req.currentUser
    );

    await validateCrudPayload(tableKey, payload, req.currentUser);
    await record.update(payload);

    return res.redirect(`/${tableKey}?page=${page}&status=updated`);
  } catch (error) {
    return renderTablePage(req, res, {
      page,
      editId: id,
      editValues: error.statusCode && error.statusCode !== 400 ? null : req.body,
      skipRedirect: true,
      statusCode: error.statusCode || 400,
      errorMessage: error.statusCode ? error.message : formatSequelizeError(error),
    });
  }
}

async function handleDelete(req, res) {
  const tableKey = req.params.table;
  const page = parsePage(req.body.page);
  const id = parseId(req.params.id);
  const pageConfig = tablePages[tableKey];

  if (!id) {
    return renderTablePage(req, res, {
      page,
      skipRedirect: true,
      statusCode: 400,
      errorMessage: `Identifiant ${pageConfig.singular.toLowerCase()} invalide.`,
    });
  }

  try {
    assertTablePermission(req.currentUser, tableKey, 'delete');

    const record = await findRecordForMutation(tableKey, id, req.currentUser);
    await record.destroy();

    return res.redirect(`/${tableKey}?page=${page}&status=deleted`);
  } catch (error) {
    return renderTablePage(req, res, {
      page,
      skipRedirect: true,
      statusCode: error.statusCode || 400,
      errorMessage: error.statusCode ? error.message : formatSequelizeError(error),
    });
  }
}

module.exports = {
  TABLE_ROUTE_PATTERN,
  handleCreate,
  handleDelete,
  handleUpdate,
  renderTablePage,
};
