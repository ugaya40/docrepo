export const resolvePath = (currentPath: string, relativeHref: string): string => {
  if (relativeHref.startsWith('/')) return relativeHref.slice(1);
  
  const [cleanHref] = relativeHref.split(/[?#]/);
  if (!cleanHref) return currentPath;

  const stack = currentPath.split('/');
  stack.pop();

  const parts = cleanHref.split('/');
  
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  
  return stack.join('/');
};