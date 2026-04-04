function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function pickDefined(source, fields) {
  return fields.reduce((accumulator, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      accumulator[field] = source[field];
    }

    return accumulator;
  }, {});
}

function formatSequelizeError(error) {
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return error.errors.map((item) => item.message).join(' ');
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return 'Une relation obligatoire est invalide ou inexistante.';
  }

  return error.message || 'Une erreur est survenue.';
}

function handleApiError(res, error, status = 400) {
  return res.status(status).json({
    message: formatSequelizeError(error),
  });
}

module.exports = {
  formatSequelizeError,
  parseId,
  pickDefined,
  handleApiError,
};
