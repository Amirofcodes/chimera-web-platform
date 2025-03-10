export const sanitizeHTML = (html: string): string => {
    const element = document.createElement('div');
    element.textContent = html;
    return element.innerHTML;
  };
  
  export const isValidToken = (token: string): boolean => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      const payload = JSON.parse(jsonPayload);
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  };