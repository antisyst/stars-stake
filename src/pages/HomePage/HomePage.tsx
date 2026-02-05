import { Page } from "@/components/Page";
import { Header } from "@/components/Header/Header";
import { StakeSection } from "@/components/StakeSection/StakeSection";
import { StatsSection } from "@/components/StatsSection/StatsSection";
import { CampaignSection } from "@/components/CampaignSection/CampaignSection";
import { WithdrawOptions } from "@/components/WithdrawOptions/WithdrawOptions";
import { EcosystemBenefits } from "@/components/EcosystemBenefits/EcosystemBenefits";
import { TierProgress } from "@/components/TierProgress/TierProgress";
import { FaqSection } from "@/components/FaqSection/FaqSection";
import { HistorySection } from "@/components/HistorySection/HistorySection";
import { RaffleBannerSection } from "@/components/RaffleBannerSection/RaffleBannerSection";
import styles from './HomePage.module.scss';

export const HomePage = () => {
  return (
    <Page back={false}>
      <div className={styles.homePage}>
       <Header/>
       <RaffleBannerSection/>
       <StakeSection/>
       <StatsSection/>
       <TierProgress/>
       <WithdrawOptions/>
       <EcosystemBenefits/>
       <CampaignSection/>
       <FaqSection/>
       <HistorySection/>
      </div>
    </Page>
  )
}