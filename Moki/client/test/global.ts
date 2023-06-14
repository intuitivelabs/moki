export const setup = () => {
  // Hello, it's me 3 hours later, just found out that GMT offset is reversed for zones east of GMT, so here -2 means +2 hours. 
  // https://en.wikipedia.org/wiki/Tz_database#Area
  process.env.TZ = "Etc/GMT-2";
};
