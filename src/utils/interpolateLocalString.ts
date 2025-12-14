export  function interpolateLocalString(s: string, params: Record<string, string | number>) {
    if (!s) return s;
    return String(s).replace(/{([^}]+)}/g, (_, name) => {
      const v = params[name];
      return v === undefined || v === null ? `{${name}}` : String(v);
    });
}