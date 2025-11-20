export function getKeyList(listOfObjects) {
    if (listOfObjects.length > 0) {
        // Get the keys from the first object in the list
        const firstObject = listOfObjects[0];
        const keys = Object.keys(firstObject);
        return keys
    } else {
        return []
    }
}

export const joinStringArray = (input) => {
    if (typeof input === 'string') {
        return input; // If input is already a string, return it
    } else if (Array.isArray(input)) {
        // If input is an array, join its string elements
        return input.filter(item => typeof item === 'string').join('');
    } else {
        // Handle other types of input (optional)
        return ''; // Return empty string if input is neither string nor array
    }
};

export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

export const safeParseAuthors = (authorsString) => {
  if (!authorsString || typeof authorsString !== 'string') {
    return [];
  }
  const authors = authorsString.split(/[,;]/);
  return authors
    .map(author => author.trim().replace(/['"\[\]]/g, '')) // Remove brackets and quotes
    .filter(author => author.length > 0); // Remove any empty strings

};



export const formatAuthors = (authors) => {
  if (!Array.isArray(authors) || authors.length === 0) {
    return 'N/A';
  }
  if (authors.length === 1) {
    return authors[0];
  }
  if (authors.length === 2) {
    return authors.join(' & '); // Use "&" for two authors
  }
  return `${authors[0]} et al.`;
};


export const stringToList = (str, mappers) => {
  // Return an empty array if the input is not a valid string
  if (typeof str !== 'string' || !str) {
    return [];
  }

  // 1. Convert the string to a clean list of keys
  const keys = str
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);

  // 2. Map each key to its display value using the mapper
  return keys.map(key => {
    // Use the mapper value if it exists, otherwise, use the key as a fallback
    return mappers[key] || key;
  });
};

export const getLastItem = (inputString) => {
  // Return undefined for null, undefined, or empty string input
  if (!inputString || typeof inputString !== 'string') {
    return undefined;
  }
  
  // 1. Split the string into an array of items
  const items = inputString.split(';');
  
  // 2. Get the last item from the array
  const lastItem = items.pop();
  
  // 3. Return the item after trimming whitespace
  return lastItem ? lastItem.trim() : undefined;
}