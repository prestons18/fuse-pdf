/** @jsx createElement */
import { createElement } from "./src/runtime";
import { Doc, Page, Text, Box } from "./src/components";
import { render } from "./src/render";

const portfolio = (
  <Doc>
    <Page>
      {/* Header Section with Background */}
      <Box backgroundColor="#1e293b" padding={[40, 50, 40, 50]} margin={[0, 0, 30, 0]}>
        <Text size={32} weight="bold" colour="#ffffff" align="center" margin={[0, 0, 8, 0]}>
          John Doe
        </Text>
        <Text size={14} colour="#94a3b8" align="center" margin={[0, 0, 15, 0]}>
          Senior Software Engineer
        </Text>
        <Text size={11} colour="#cbd5e1" align="center">
          john.doe@example.com • +1 (555) 123-4567 • github.com/johndoe
        </Text>
      </Box>

      {/* Professional Summary */}
      <Box margin={[0, 0, 25, 0]}>
        <Text size={18} weight="bold" colour="#1e293b" margin={[0, 0, 12, 0]}>
          Professional Summary
        </Text>
        <Box backgroundColor="#f8fafc" padding={[15, 20, 15, 20]}>
          <Text size={11} colour="#334155" margin={[0, 0, 8, 0]}>
            Innovative software engineer with 8+ years of experience building scalable web applications 
            and distributed systems. Expertise in TypeScript, React, and Node.js with a proven track 
            record of delivering high-impact solutions.
          </Text>
        </Box>
      </Box>

      {/* Experience Section */}
      <Box margin={[0, 0, 25, 0]}>
        <Text size={18} weight="bold" colour="#1e293b" margin={[0, 0, 15, 0]}>
          Experience
        </Text>

        {/* Job 1 */}
        <Box margin={[0, 0, 20, 0]}>
          <Box backgroundColor="#f1f5f9" padding={[12, 15, 12, 15]} margin={[0, 0, 10, 0]}>
            <Text size={13} weight="bold" colour="#0f172a" margin={[0, 0, 4, 0]}>
              Acme Inc. — Lead Software Engineer
            </Text>
            <Text size={10} style="italic" colour="#64748b">
              January 2021 - Present
            </Text>
          </Box>
          <Box padding={[0, 0, 0, 15]}>
            <Text size={11} colour="#334155" margin={[0, 0, 6, 0]}>
              • Led team of 6 engineers in developing cloud-native microservices architecture
            </Text>
            <Text size={11} colour="#334155" margin={[0, 0, 6, 0]}>
              • Reduced system latency by 40% through optimization and caching strategies
            </Text>
            <Text size={11} colour="#334155" margin={[0, 0, 6, 0]}>
              • Implemented CI/CD pipelines reducing deployment time from hours to minutes
            </Text>
          </Box>
        </Box>

        {/* Job 2 */}
        <Box margin={[0, 0, 20, 0]}>
          <Box backgroundColor="#f1f5f9" padding={[12, 15, 12, 15]} margin={[0, 0, 10, 0]}>
            <Text size={13} weight="bold" colour="#0f172a" margin={[0, 0, 4, 0]}>
              Example Corp — Senior Full Stack Developer
            </Text>
            <Text size={10} style="italic" colour="#64748b">
              March 2018 - December 2020
            </Text>
          </Box>
          <Box padding={[0, 0, 0, 15]}>
            <Text size={11} colour="#334155" margin={[0, 0, 6, 0]}>
              • Built real-time analytics dashboard serving 100K+ daily active users
            </Text>
            <Text size={11} colour="#334155" margin={[0, 0, 6, 0]}>
              • Architected RESTful APIs and GraphQL endpoints for mobile applications
            </Text>
            <Text size={11} colour="#334155" margin={[0, 0, 6, 0]}>
              • Mentored junior developers and conducted code reviews
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Skills Section */}
      <Box margin={[0, 0, 20, 0]}>
        <Text size={18} weight="bold" colour="#1e293b" margin={[0, 0, 12, 0]}>
          Technical Skills
        </Text>
        <Box backgroundColor="#eff6ff" padding={[15, 20, 15, 20]}>
          <Text size={11} colour="#1e40af" weight="bold" margin={[0, 0, 8, 0]}>
            Languages & Frameworks
          </Text>
          <Text size={11} colour="#334155" margin={[0, 0, 12, 0]}>
            TypeScript, JavaScript, Python, React, Node.js, Express, Next.js
          </Text>
          
          <Text size={11} colour="#1e40af" weight="bold" margin={[0, 0, 8, 0]}>
            Tools & Technologies
          </Text>
          <Text size={11} colour="#334155">
            Docker, Kubernetes, AWS, PostgreSQL, Redis, Git, CI/CD
          </Text>
        </Box>
      </Box>

      {/* Education */}
      <Box>
        <Text size={18} weight="bold" colour="#1e293b" margin={[0, 0, 12, 0]}>
          Education
        </Text>
        <Box backgroundColor="#f1f5f9" padding={[12, 15, 12, 15]}>
          <Text size={12} weight="bold" colour="#0f172a" margin={[0, 0, 4, 0]}>
            Bachelor of Science in Computer Science
          </Text>
          <Text size={10} colour="#64748b">
            State University • 2014 - 2018 • GPA: 3.8/4.0
          </Text>
        </Box>
      </Box>
    </Page>
  </Doc>
);

await render(portfolio, "portfolio.pdf");