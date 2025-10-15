/** @jsx createElement */
import { createElement } from "./src/runtime";
import { Doc, Page, Text, Box } from "./src/components";
import { render } from "./src/render";

const portfolio = (
  <Doc>
    <Page>
      {/* Header Section */}
      <Box backgroundColor="#2563eb" padding={[30, 40, 30, 40]} margin={[0, 0, 25, 0]}>
        <Text size={28} weight="bold" colour="#ffffff" align="center" margin={[0, 0, 6, 0]}>
          John Doe
        </Text>
        <Text size={13} colour="#ffffff" align="center" margin={[0, 0, 12, 0]}>
          Senior Software Engineer
        </Text>
        <Text size={10} colour="#dbeafe" align="center">
          john.doe@example.com • +1 (555) 123-4567 • github.com/johndoe
        </Text>
      </Box>

      {/* Professional Summary */}
      <Box margin={[0, 0, 20, 0]}>
        <Text size={16} weight="bold" colour="#000000" margin={[0, 0, 10, 0]}>
          PROFESSIONAL SUMMARY
        </Text>
        <Box backgroundColor="#e0e7ff" padding={[12, 15, 12, 15]}>
          <Text size={11} colour="#1e1b4b">
            Innovative software engineer with 8+ years of experience building scalable web applications 
            and distributed systems. Expertise in TypeScript, React, and Node.js with a proven track 
            record of delivering high-impact solutions.
          </Text>
        </Box>
      </Box>

      {/* Experience Section */}
      <Box margin={[0, 0, 20, 0]}>
        <Text size={16} weight="bold" colour="#000000" margin={[0, 0, 10, 0]}>
          EXPERIENCE
        </Text>

        {/* Job 1 */}
        <Box margin={[0, 0, 15, 0]}>
          <Text size={12} weight="bold" colour="#000000" margin={[0, 0, 3, 0]}>
            Lead Software Engineer
          </Text>
          <Text size={11} colour="#2563eb" margin={[0, 0, 8, 0]}>
            Acme Inc. • January 2021 - Present
          </Text>
          <Text size={10} colour="#1f2937" margin={[0, 0, 4, 0]}>
            • Led team of 6 engineers in developing cloud-native microservices architecture
          </Text>
          <Text size={10} colour="#1f2937" margin={[0, 0, 4, 0]}>
            • Reduced system latency by 40% through optimization and caching strategies
          </Text>
          <Text size={10} colour="#1f2937" margin={[0, 0, 4, 0]}>
            • Implemented CI/CD pipelines reducing deployment time from hours to minutes
          </Text>
        </Box>

        {/* Job 2 */}
        <Box margin={[0, 0, 15, 0]}>
          <Text size={12} weight="bold" colour="#000000" margin={[0, 0, 3, 0]}>
            Senior Full Stack Developer
          </Text>
          <Text size={11} colour="#2563eb" margin={[0, 0, 8, 0]}>
            Example Corp • March 2018 - December 2020
          </Text>
          <Text size={10} colour="#1f2937" margin={[0, 0, 4, 0]}>
            • Built real-time analytics dashboard serving 100K+ daily active users
          </Text>
          <Text size={10} colour="#1f2937" margin={[0, 0, 4, 0]}>
            • Architected RESTful APIs and GraphQL endpoints for mobile applications
          </Text>
          <Text size={10} colour="#1f2937" margin={[0, 0, 4, 0]}>
            • Mentored junior developers and conducted code reviews
          </Text>
        </Box>
      </Box>

      {/* Skills Section */}
      <Box margin={[0, 0, 20, 0]}>
        <Text size={16} weight="bold" colour="#000000" margin={[0, 0, 10, 0]}>
          TECHNICAL SKILLS
        </Text>
        <Box backgroundColor="#dbeafe" padding={[12, 15, 12, 15]}>
          <Text size={10} weight="bold" colour="#000000" margin={[0, 0, 5, 0]}>
            Languages & Frameworks:
          </Text>
          <Text size={10} colour="#1f2937" margin={[0, 0, 10, 0]}>
            TypeScript, JavaScript, Python, React, Node.js, Express, Next.js
          </Text>
          
          <Text size={10} weight="bold" colour="#000000" margin={[0, 0, 5, 0]}>
            Tools & Technologies:
          </Text>
          <Text size={10} colour="#1f2937">
            Docker, Kubernetes, AWS, PostgreSQL, Redis, Git, CI/CD
          </Text>
        </Box>
      </Box>

      {/* Education */}
      <Box>
        <Text size={16} weight="bold" colour="#000000" margin={[0, 0, 10, 0]}>
          EDUCATION
        </Text>
        <Text size={11} weight="bold" colour="#000000" margin={[0, 0, 3, 0]}>
          Bachelor of Science in Computer Science
        </Text>
        <Text size={10} colour="#2563eb" margin={[0, 0, 5, 0]}>
          State University • 2014 - 2018
        </Text>
        <Text size={10} colour="#1f2937">
          GPA: 3.8/4.0
        </Text>
      </Box>
    </Page>
  </Doc>
);

await render(portfolio, "portfolio.pdf");