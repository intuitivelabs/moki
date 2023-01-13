export default function isURL(value) {
  try {
      new URL(value);
  } catch (error) {
      console.error(value +" is not url. "+error);
      return false;
  }
  return true;

}