export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // 允许的域名列表 (生产环境自定义域名)
  const allowedDomains = ['apps.binacs.space', 'localhost', '127.0.0.1'];
  
  // 如果请求的域名不在允许列表中 (例如 *.pages.dev)，则拒绝访问或重定向
  if (!allowedDomains.includes(url.hostname) && !url.hostname.endsWith('.localhost')) {
    // 方案 A: 直接拒绝 (403 Forbidden)
    // return new Response("Forbidden: Access via this domain is not allowed.", { status: 403 });

    // 方案 B: 重定向到生产域名 (301 Moved Permanently) - 推荐
    // 注意：如果是 Pages 预览域名 (*.pages.dev)，直接重定向到生产域名
    return Response.redirect('https://apps.binacs.space' + url.pathname + url.search, 301);
  }

  return context.next();
}
