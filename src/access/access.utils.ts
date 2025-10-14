import micromatch from 'micromatch';
import type { Statement } from './access.schemas.ts';

type ValidateOptions = {
  action: string;
  resource: string;
  statements: Statement[];
};

const validate = (options: ValidateOptions) => {
  const { statements, resource, action } = options;
  const matches = statements.filter(
    (statement) => micromatch.isMatch(resource, statement.resources) && micromatch.isMatch(action, statement.actions),
  );
  if (matches.length === 0) {
    return false;
  }
  if (matches.find((statement) => statement.effect === 'disallow')) {
    return false;
  }
  return true;
};

export { validate };
