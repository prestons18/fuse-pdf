/** @jsx createElement */
import { createElement } from "../../src/runtime";
import { Doc, Page, Text, Section, Box } from "../../src/components";
import { render } from "../../src/render";

const demo = (
  <Doc>
    <Page>
      <Text size={24} weight="bold" align="center" margin={[0, 0, 20, 0]}>
        Font Variety Demo
      </Text>

      {/* Helvetica Family */}
      <Section title="Helvetica Font Family">
        <Box margin={[10, 0, 20, 0]}>
          <Text size={12} font="Helvetica" weight="normal" margin={[0, 0, 5, 0]}>
            Helvetica Normal - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Helvetica" weight="bold" margin={[0, 0, 5, 0]}>
            Helvetica Bold - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Helvetica" style="italic" margin={[0, 0, 5, 0]}>
            Helvetica Italic - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Helvetica" style="bold-italic" margin={[0, 0, 5, 0]}>
            Helvetica Bold Italic - The quick brown fox jumps over the lazy dog
          </Text>
        </Box>
      </Section>

      {/* Times Family */}
      <Section title="Times Font Family">
        <Box margin={[10, 0, 20, 0]}>
          <Text size={12} font="Times" weight="normal" margin={[0, 0, 5, 0]}>
            Times Normal - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Times" weight="bold" margin={[0, 0, 5, 0]}>
            Times Bold - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Times" style="italic" margin={[0, 0, 5, 0]}>
            Times Italic - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Times" style="bold-italic" margin={[0, 0, 5, 0]}>
            Times Bold Italic - The quick brown fox jumps over the lazy dog
          </Text>
        </Box>
      </Section>

      {/* Courier Family */}
      <Section title="Courier Font Family">
        <Box margin={[10, 0, 20, 0]}>
          <Text size={12} font="Courier" weight="normal" margin={[0, 0, 5, 0]}>
            Courier Normal - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Courier" weight="bold" margin={[0, 0, 5, 0]}>
            Courier Bold - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Courier" style="italic" margin={[0, 0, 5, 0]}>
            Courier Italic - The quick brown fox jumps over the lazy dog
          </Text>
          <Text size={12} font="Courier" style="bold-italic" margin={[0, 0, 5, 0]}>
            Courier Bold Italic - The quick brown fox jumps over the lazy dog
          </Text>
        </Box>
      </Section>

      {/* Practical Example */}
      <Section title="Practical Example">
        <Box 
          border={{ width: 2, color: "#2563eb" }} 
          padding={[20, 20, 20, 20]} 
          margin={[10, 0, 0, 0]}
        >
          <Text size={18} font="Times" weight="bold" colour="#1a1a1a" margin={[0, 0, 10, 0]}>
            Professional Resume Header
          </Text>
          <Text size={12} font="Helvetica" style="italic" colour="#6b7280" margin={[0, 0, 15, 0]}>
            Senior Software Engineer
          </Text>
          <Text size={11} font="Helvetica" weight="normal" colour="#374151" margin={[0, 0, 8, 0]}>
            This demonstrates how different fonts can be combined for visual hierarchy and emphasis.
          </Text>
          <Text size={10} font="Courier" weight="bold" colour="#059669">
            Code: const result = await render(document, "output.pdf");
          </Text>
        </Box>
      </Section>
    </Page>
  </Doc>
);

await render(demo, "../out/font-demo.pdf");