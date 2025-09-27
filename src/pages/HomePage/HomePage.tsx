import { StakeSection } from "@/components/StakeSection/StakeSection";
import { Page } from "@/components/Page";

export const HomePage = () => {
  return (
    <Page back={false}>
      <StakeSection/>
    </Page>
  )
}