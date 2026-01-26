export function getUniques(array: any[], key: string): string[] {
  const uniqueSet = new Set<string>();
  array.forEach((item) => {
    const value = item[key];
    if (value) {
      uniqueSet.add(String(value).trim());
    }
  });
  return Array.from(uniqueSet).sort();
}
