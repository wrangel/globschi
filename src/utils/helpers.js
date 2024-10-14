export const getId = (path) => {
  return path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
};

// You can add more utility functions here as needed
