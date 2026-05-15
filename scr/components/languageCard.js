import React from "react"
import { Pressable, Text, View } from "react-native"
import { langCardStyle } from "../styles/global.styles"
import { MyIcon } from "./icons"
import { colors } from "../config/colors"


export const LangCard = React.memo(({title, _onPressEvent}) => {
    return (
        <Pressable onPress={_onPressEvent} style={[langCardStyle.containerStyle, langCardStyle.elevation]}>
            <MyIcon name="book-outline" size={30} color={colors.primaryColor} />
            <Text style={langCardStyle.languageButtonText}>{title}</Text>
        </Pressable>
    )
})
