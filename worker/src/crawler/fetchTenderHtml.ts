export async function fetchTenderHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'TenderGoBot/1.0',
      'accept-language': 'zh-TW,zh;q=0.9'
    }
  });
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return response.text();
}
