/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 120,
    },
    {
      fieldName: "supportEmail",
      type: "string",
      required: false,
      label: "Support Email",
    },
    {
      fieldName: "currencySymbol",
      type: "string",
      required: false,
      label: "Currency Symbol",
      maxLength: 4,
    },
    {
      fieldName: "deliveryFee",
      type: "number",
      required: false,
      label: "Default Delivery Fee",
      min: 0,
      max: 1000,
    },
    {
      fieldName: "heroHeadline",
      type: "string",
      required: false,
      label: "Home Hero Headline",
      maxLength: 80,
    },
    {
      fieldName: "heroSubtext",
      type: "string",
      required: false,
      label: "Home Hero Subtext",
      maxLength: 160,
    },
    {
      fieldName: "searchPlaceholder",
      type: "string",
      required: false,
      label: "Search Placeholder",
      maxLength: 80,
    },
    {
      fieldName: "categories",
      type: "array",
      required: false,
      label: "Popular Categories",
      item: {
        type: "object",
        fields: [
          { fieldName: "name", type: "string", required: true, label: "Name" },
          { fieldName: "icon", type: "string", required: false, label: "Emoji Icon" },
        ],
      },
    },
    {
      fieldName: "promoBanners",
      type: "array",
      required: false,
      label: "Promo Banners",
      item: {
        type: "object",
        fields: [
          { fieldName: "title", type: "string", required: true, label: "Title" },
          { fieldName: "subtitle", type: "string", required: false, label: "Subtitle" },
          { fieldName: "imageUrl", type: "url", required: false, label: "Image URL" },
        ],
      },
    },
    {
      fieldName: "showFeaturedShops",
      type: "boolean",
      required: false,
      label: "Show Featured Shops Section",
    },
    {
      fieldName: "showRecommendedProducts",
      type: "boolean",
      required: false,
      label: "Show Recommended Products Section",
    },
  ],
};