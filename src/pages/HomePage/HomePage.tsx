import { StakeSection } from "@/components/StakeSection/StakeSection";
import { Page } from "@/components/Page";
import styles from './HomePage.module.scss';

export const HomePage = () => {
  return (
    <Page back={false}>
      <div className={styles.homePage}></div>
      <StakeSection/>
    </Page>
  )
}