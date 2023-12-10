const StringUtils = {
  // xx_yy_zz => xx-yy-zz
  convertToHyphenCase: (input: string): string => {
    return input.replace(/_/g, '-');
  },

  // xx-yy-zz => xxYyZz
  convertToCamelCase: (input: string): string => {
    return input.replace(/_./g, (match) => match.charAt(1).toUpperCase());
  },

  // xx-yy-zz => XxYyZz
  convertToPascalCase: (input: string): string => {
    const camelCase = StringUtils.convertToCamelCase(input);
    return camelCase.charAt(0).toLocaleUpperCase() + camelCase.slice(1);
  },
};

export default StringUtils;
