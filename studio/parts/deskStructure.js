import S from "@sanity/desk-tool/structure-builder";
import { createSuperPane } from "sanity-super-pane";

export default () =>
  S.list()
    .title("Content")
    .items([
      S.listItem().title("Rangers").child(createSuperPane("ranger", S)),
      S.listItem()
        .title("Settings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings")
        ),
      ...S.documentTypeListItems().filter(
        (listItem) => !["siteSettings"].includes(listItem.getId())
      ),
    ]);
