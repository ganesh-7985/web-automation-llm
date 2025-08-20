export function parsePriceToNumber(text){
    if(!text) return NaN
    const cleaned = String(text).replace(/[^\d.,]/g, "").replace(/,/g, "");
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
}

export function coerceJSON(text, fallback) {
    if (!text || typeof text !== "string") return fallback;
  
    // 1) direct parse
    try {
      return JSON.parse(text);
    } catch {}
  
    // 2) fenced ```json ... ```
    const fence = text.match(/```json\s*([\s\S]*?)```/i);
    if (fence && fence[1]) {
      try {
        return JSON.parse(fence[1]);
      } catch {}
    }
  
    // 3) first '{' .. last '}'
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = text.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch {}
    }
  
    return fallback;
  }