import alasql from 'alasql';

/**
 * @param {string} sql
 * @returns {string}
 */
export function transformQuery(sql) {
  // @ts-ignore
  const { Select, Table, Column, NumValue } = alasql.yy;
  const ast = alasql.parse(sql);
  // @ts-ignore
  const select = ast.statements.find((s) => s instanceof Select);
  if (!select) {
    throw new Error('No SELECT statement found');
  }
  // Enforce special table name
  select.from = [new Table({ tableid: '?' })];
  // Enforce all columns in the result
  select.columns = [...(select.columns ?? []), new Column({ columnid: 'cid' })];
  // Enforce limit of 10 rows
  select.limit = new NumValue({ value: select.limit?.value ?? 10 });
  //FIXME: There is a possibility of SQL injection & filesystem access here
  return ast.toString();
}
