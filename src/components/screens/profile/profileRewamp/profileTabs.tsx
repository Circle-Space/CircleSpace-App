import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { Color, FontSizes, FontFamilies } from '../../../../styles/constants';

interface ProfileTabsProps {
    activeTab: string;
    accountType: string;
    hasCatalog: boolean;
    onTabPress: (tab: string) => void;
    isLoading: boolean;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
    activeTab,
    accountType,
    hasCatalog,
    onTabPress,
    isLoading
}) => {
    const isPersonal = accountType === 'personal';

    const renderTab = (tabName: string, iconSource: any, activeIconSource: any) => {
        const isActive = activeTab === tabName;
        const tabWidth = isPersonal ? '50%' : '25%';

        return (
            <TouchableOpacity
                style={[
                    styles.tab,
                    { width: tabWidth },
                    isActive && styles.activeTab,
                ]}
                onPress={() => !isLoading && onTabPress(tabName)}
                disabled={isLoading}
            >
                <Image
                    source={isActive ? activeIconSource : iconSource}
                    style={styles.tabIcon}
                />
                <Text style={[
                    styles.tabText,
                    isActive && styles.activeTabText
                ]}>
                    {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {renderTab(
                'posts',
                require('../../../../assets/profile/tabs/postInactive.png'),
                require('../../../../assets/profile/tabs/postActive.png')
            )}
            {!isPersonal && renderTab(
                'projects',
                require('../../../../assets/profile/tabs/projectInactive.png'),
                require('../../../../assets/profile/tabs/projectActive.png')
            )}
            {hasCatalog && renderTab(
                'catalog',
                require('../../../../assets/profile/tabs/catalogInactive.png'),
                require('../../../../assets/profile/tabs/catalogActive.png')
            )}
            {renderTab(
                'spaces',
                require('../../../../assets/profile/tabs/savedInactive.png'),
                require('../../../../assets/profile/tabs/savedActive.png')
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Color.grey,
        backgroundColor: '#ffffff',
    },
    tab: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Color.black,
    },
    tabIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginBottom: 4,
    },
    tabText: {
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.regular,
        color: Color.grey,
    },
    activeTabText: {
        color: Color.black,
        fontFamily: FontFamilies.semibold,
    },
});

export default ProfileTabs; 