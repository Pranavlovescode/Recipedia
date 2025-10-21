import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Text style={styles.secondText}>This is the new text box</Text>
    </View>
    
  );
}

const styles = StyleSheet.create({
  secondText:{
    flex:1,
    padding:39,
    backgroundColor:"cyan"
  }
})
