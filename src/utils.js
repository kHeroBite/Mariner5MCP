import Ajv from 'ajv';

export function tpl(str, params) {
  return str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '');
}

export function makeValidator(schema) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  return (input) => {
    const ok = validate(input);
    if (!ok) {
      const msg = (validate.errors||[]).map(e => `${e.instancePath} ${e.message}`).join('; ');
      const err = new Error(`입력 스키마 검증 실패: ${msg}`);
      err.code = 'E_INVALID_INPUT';
      err.details = validate.errors;
      throw err;
    }
    return input;
  };
}

export function ok(endpoint, request, data, meta={}) {
  return { success: true, endpoint, request, data, meta };
}

export function fail(code, message, details={}, hint='') {
  return { success: false, code, message, details, hint };
}
