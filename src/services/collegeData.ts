export const fetchCollegeData = async (query: string) => {
  const API_KEY = process.env.COLLEGE_API_KEY;
  const response = await fetch(
    `https://api.collegedata.com/v4/colleges?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`
  );
  return response.json();
}; 