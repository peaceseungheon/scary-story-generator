import { Asset, Text, ListHeader, TextField, Button } from "@toss/tds-mobile";
import { adaptive, colors } from "@toss/tds-colors";
import { Spacing } from "./Spacing";
import { useState } from "react";

export default function Page() {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "start",
      justifyContent: "start",
      minHeight: "100vh",
      padding: "20px",
      background: `linear-gradient(180deg, ${colors.blue50} 0%, ${colors.grey50} 100%)`,
    },
    content: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      maxWidth: "400px",
      width: "100%",
    },
    title: {
      fontSize: "22px",
      fontWeight: 700,
      color: colors.grey900,
      textAlign: "left" as const,
      margin: 0,
      letterSpacing: "-0.4px",
    },
    subtitle: {
      fontSize: "15px",
      fontWeight: 400,
      color: colors.grey600,
      textAlign: "center" as const,
      margin: 0,
      lineHeight: 1.5,
    },
  };

  const [keyword, setKeyword] = useState("");


  return (
    <div style={styles.container}>
      <>
        <ListHeader
          title={
            <ListHeader.TitleParagraph style={styles.title} color={adaptive.grey800} fontWeight="bold" typography="t5">
              키워드를 입력해주세요
            </ListHeader.TitleParagraph>
          }
          descriptionPosition="bottom"
        />
        <Spacing size={44} />
        <Text display="block" color={adaptive.grey700} typography="t5" fontWeight="regular">
          몇가지 키워드를 입력해 오싹한 이야기를 만들어보세요!
        </Text>
        {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
        <TextField variant="box" value={keyword} onChange={e=> setKeyword(e.target.value)} placeholder="ex) 여고 괴담, 동네 괴담 ..."/>
        <Button >썰 만들기</Button>
      </>
    </div>
  );
}
