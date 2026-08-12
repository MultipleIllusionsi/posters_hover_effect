/**
 * Открывает внешнюю ссылку в новой вкладке.
 *
 * Через программный клик по <a target="_blank">, а НЕ через window.open: вызов
 * window.open с непустой строкой фич («noopener,noreferrer») браузер трактует
 * как попап, и на реальном домене блокировщик попапов его режет (на localhost
 * попапы обычно разрешены, поэтому там всё работало). Навигация по ссылке-якорю
 * в рамках пользовательского клика попапом не считается и не блокируется.
 */
export function openExternal(url) {
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
