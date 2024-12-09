import {
  t_color_gray_90,
  t_color_gray_50,
  t_color_gray_30,
  t_color_green_50,
  t_color_blue_40,
  t_color_purple_10,
  t_color_purple_50,
  t_color_orange_10,
  t_color_orange_30,
  t_color_orange_40,
  t_color_red_50,
  t_color_teal_50,
  t_color_white,
  t_global_font_family_100,
  t_global_border_width_100,
  t_global_border_radius_large
} from '@patternfly/react-tokens';

export const hexColors = {
  White: t_color_white.value,
  Black300: t_color_gray_30.value,
  Black500: t_color_gray_50.value,
  Black900: t_color_gray_90.value,
  Blue400: t_color_blue_40.value,
  Purple100: t_color_purple_10.value,
  Purple500: t_color_purple_50.value,
  Orange100: t_color_orange_10.value,
  Orange300: t_color_orange_30.value,
  Orange400: t_color_orange_40.value,
  Red500: t_color_red_50.value,
  Teal500: t_color_teal_50.value,
  Green500: t_color_green_50.value
};

export const styles = {
  default: {
    fontFamily: t_global_font_family_100.value,
    borderWidth: t_global_border_width_100.value,
    borderRadius: t_global_border_radius_large.value,
    lightBackgroundColor: hexColors.White,
    lightTextColor: hexColors.White,
    darkBackgroundColor: hexColors.Black500,
    darkTextColor: hexColors.Black900,
    infoColor: hexColors.Blue400,
    errorColor: hexColors.Red500,
    warningColor: hexColors.Orange400
  }
};
