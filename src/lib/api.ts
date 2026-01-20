export const fetchCatalog = async () => {
  const res = await fetch('https://raw.githubusercontent.com/ust-archive/ust-course-catalog/refs/heads/main/course-catalog.json');
  return res.json();
};