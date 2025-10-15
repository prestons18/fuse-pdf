/** @jsx createElement */
import { createElement } from "./src/runtime";
import { Doc, Page, Text, Section } from "./src/components";
import { render } from "./src/render";

const portfolio = (
  <Doc>
    <Page>
      <Text size={24}>Preston Arnold</Text>
      <Text size={14} colour="#3366ff" align="center" margin={[10, 0, 5, 0]}>Software Developer</Text>

      <Section title="Experience">
        <Text>Experience</Text>
      </Section>
    </Page>
  </Doc>
);

await render(portfolio, "portfolio.pdf");