const calculateProfileStrength = (user) => {
  const profileFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "about",
    "age",
    "gender",
    "location",
    "designation",
    "currentCompany",
    "totalExperience",
    "skills",
    "experience",
    "projects",
    "socialLinks",
  ];

  const missingFields = [];

  profileFields.forEach((field) => {
    const value = user[field];

    const isFilled =
      Array.isArray(value)
        ? value.length > 0
        : value instanceof Map
        ? value.size > 0
        : value !== undefined &&
          value !== null &&
          value !== "";

    if (!isFilled) {
      missingFields.push(field);
    }
  });

  const completedFields = profileFields.length - missingFields.length;

  const profileStrength = Math.round(
    (completedFields / profileFields.length) * 100
  );

  return {
    profileStrength,
    missingFields,
  };
};

module.exports = calculateProfileStrength;