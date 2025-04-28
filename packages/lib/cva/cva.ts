type ValidVariantTypes = string | number | null | boolean | undefined;
type Variants = Record<string, ValidVariantTypes | ValidVariantTypes[]> & { className: string };

/**
 * Lets you use arrays for variants as well. This util combines all possible
 * variants and returns an array with all possible options. Simply
 * spread this in the compoundVariants.
 */
export const applyStyleToMultipleVariants = (variants: Variants) => {
  const allKeysThatAreArrays = Object.keys(variants).filter((key) => Array.isArray(variants[key]));
  const allKeysThatAreNotArrays = Object.keys(variants).filter((key) => !Array.isArray(variants[key]));
  // Creates an object of all static options, ready to be merged in later with the array values.
  const nonArrayOptions = allKeysThatAreNotArrays.reduce((acc, key) => {
    return { ...acc, [key]: variants[key] };
  }, {});

  const cartesianProductOfAllArrays = cartesianProduct(
    allKeysThatAreArrays.map((key) => variants[key]) as ValidVariantTypes[][]
  );

  return cartesianProductOfAllArrays.map((variant) => {
    const variantObject = variant.reduce((acc, value, index) => {
      return { ...acc, [allKeysThatAreArrays[index]]: value };
    }, {});

    return {
      ...nonArrayOptions,
      ...variantObject,
    };
  });
};

export const cartesianProduct = <T extends ValidVariantTypes>(sets: T[][]) =>
  sets.reduce<T[][]>(
    (accSets, set) => accSets.flatMap((accSet) => set.map((value) => [...accSet, value])),
    [[]]
  );
