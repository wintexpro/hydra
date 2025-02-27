import * as graphqlFields from 'graphql-fields';
import { createParamDecorator } from 'type-graphql';

export function Fields(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    // This object will be of the form:
    //   rawFields {
    //     __objectType
    //     baseField: {},
    //     association: { subField: "foo"}
    //   }
    // We pull out items with subFields
    const rawFields = graphqlFields(info);

    return Object.keys(rawFields).filter((item) => {
      return !item.startsWith('__');
    });
  });
}

export function RawFields(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    return graphqlFields(info);
  });
}

export function NestedFields(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    // This object will be of the form:
    //   rawFields {
    //     baseField: {},
    //     association: { subField: "foo"}
    //   }
    // We need to pull out items with subFields
    const rawFields = graphqlFields(info);
    const output: any = { scalars: [] };

    for (const fieldKey in rawFields) {
      if (Object.keys(rawFields[fieldKey]).length === 0) {
        output.scalars.push(fieldKey);
      } else {
        const subFields = rawFields[fieldKey];
        output[fieldKey] = Object.keys(subFields).filter((subKey) => {
          return Object.keys(subFields[subKey]).length === 0;
        });
      }
    }

    return output;
  });
}
