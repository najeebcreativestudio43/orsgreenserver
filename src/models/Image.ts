import {
  modelOptions,
  prop as Property,
  Ref,
  plugin,
} from "@typegoose/typegoose";

export default class Image {
  @Property({ type: () => String, required: true })
  fieldname!: string;
  @Property({ type: () => String, required: true })
  originalname!: string;
  @Property({ type: () => String, required: true })
  encoding!: string;
  @Property({ type: () => String, required: true })
  mimetype!: string;
  @Property({ type: () => String, required: true })
  destination!: string;
  @Property({ type: () => String, required: true })
  filename!: string;
  @Property({ type: () => String, required: true })
  path!: string;
  @Property({ type: () => Number, required: true })
  size?: number;
}
