// Sites uses its existing server; the Pages build selects device storage explicitly.
export function clientRequest(path:string,init?:RequestInit):Promise<Response>{return fetch(path,init)}
