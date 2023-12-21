const StringUtils = {
  UNDERSCORE: {
    // xx_yy_zz => xx-yy-zz
    convertToHyphenCase: (input: string): string => {
      return input.replace(/_/g, '-');
    },

    // xx_yy_zz => xxYyZz
    convertToCamelCase: (input: string): string => {
      return input.replace(/_./g, (match) => match.charAt(1).toUpperCase());
    },

    // xx_yy_zz => XxYyZz
    convertToPascalCase: (input: string): string => {
      const camelCase = StringUtils.UNDERSCORE.convertToCamelCase(input);
      return camelCase.charAt(0).toLocaleUpperCase() + camelCase.slice(1);
    },
  },
  SLASH: {
    // xx/yy/zz => xx.yy.zz
    convertToDotCase: (input: string): string => {
      return input.replace(/\//g, '.');
    },
  },
};

export default StringUtils;
