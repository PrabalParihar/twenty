const isPlainObject = (value: object): boolean => {
  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

export const isShallowEqual = (
  firstValue: unknown,
  secondValue: unknown,
): boolean => {
  if (Object.is(firstValue, secondValue)) {
    return true;
  }

  if (
    typeof firstValue !== 'object' ||
    typeof secondValue !== 'object' ||
    firstValue === null ||
    secondValue === null
  ) {
    return false;
  }

  if (Array.isArray(firstValue) || Array.isArray(secondValue)) {
    return (
      Array.isArray(firstValue) &&
      Array.isArray(secondValue) &&
      firstValue.length === secondValue.length &&
      firstValue.every((item, index) => Object.is(item, secondValue[index]))
    );
  }

  if (!isPlainObject(firstValue) || !isPlainObject(secondValue)) {
    return false;
  }

  const firstRecord = firstValue as Record<string, unknown>;
  const secondRecord = secondValue as Record<string, unknown>;
  const firstKeys = Object.keys(firstRecord);

  return (
    firstKeys.length === Object.keys(secondRecord).length &&
    firstKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(secondRecord, key) &&
        Object.is(firstRecord[key], secondRecord[key]),
    )
  );
};
