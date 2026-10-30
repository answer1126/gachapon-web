export const metadata = {
  title: '原味台南文創坊・萬聖扭蛋',
  description: '原味台南文創坊專屬抽獎系統',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        {/* 這一行是確保您的漸層色與排版能完美顯示的魔法 */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="m-0 p-0">{children}</body>
    </html>
  );
}