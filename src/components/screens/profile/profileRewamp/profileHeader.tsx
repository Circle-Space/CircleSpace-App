import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Color, FontFamilies, FontSizes } from '../../../../styles/constants';
import { useNavigation } from '@react-navigation/native';

interface ProfileHeaderProps {
  username: string;
  userData: any;
  setOpenShare: (value: boolean) => void;
  setShowProfileOptions: (value: boolean) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  userData,
}) => {
  const navigation = useNavigation();
  
  // Memoize the badge component to prevent re-renders
  const VerifiedBadge = React.useMemo(() => {
    if (userData?.accountType === 'professional' && userData?.isPaid) {
      return (
        <Image
          source={require('../../../../assets/settings/subscription/VerifiedIcon.png')}
          style={styles.verifiedBadge2}
          resizeMode="contain"
          fadeDuration={0}
          // Force rendering priority for iOS
          defaultSource={require('../../../../assets/settings/subscription/VerifiedIcon.png')}
        />
      );
    }
    return null;
  }, [userData?.accountType, userData?.isPaid]);

  const UsernameWithBadge = ({ username, isProfessional, isPaid }: { username: string, isProfessional: boolean, isPaid: boolean }) => {
    const truncatedUsername = username?.length > 15 
      ? `${username.slice(0, 15)}...` 
      : username;

    return (
      <View style={styles.usernameRow}>
        <Text style={styles.username}>{truncatedUsername}</Text>
        {isProfessional && isPaid && VerifiedBadge}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: -8, // Reduced gap between image and text
      }}>
        <Image
          source={require('../../../../assets/header/CSLogo.png')}
          style={{
            width: 45,
            height: 45,
          }}
        />
        <UsernameWithBadge
          username={username}
          isProfessional={userData?.accountType === 'professional'}
          isPaid={userData?.isPaid}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIconContainer: {
    marginRight: 8,
  },
  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultIcon: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
  username: {
    fontSize: FontSizes.medium2,
    fontWeight: '800',
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  verifiedBadge2: {
    height: 12,
    width: 12,
    marginLeft: 2 ,
  },
});

export default ProfileHeader;