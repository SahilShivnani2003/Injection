import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Alert, Platform } from 'react-native';
import { Vendor, VendorSetting } from '@/features/vendorIdCard/types/vendor';
import { buildVendorIdCardHtml } from './vendorIdCardhtml';

/**
 * Generates a PDF of the vendor ID card and opens the native share/save
 * sheet so the vendor can save it to Files (iOS) / Downloads or Drive
 * (Android), or share it directly.
 *
 * Requires (React Native CLI, not Expo):
 *   npm install react-native-html-to-pdf react-native-share
 *   cd ios && pod install
 */
export async function downloadVendorIdCardPdf(
      vendor: Vendor,
      setting: VendorSetting,
): Promise<void> {
      try {
            const html = buildVendorIdCardHtml(vendor, setting);

            // Renders the HTML to a real PDF file on disk.
            // const file = await RNHTMLtoPDF.convert({
            //       html,
            //       fileName: `vendor_id_card_${vendor.vendorId || vendor._id}`,
            //       base64: false,
            //       // Android only: which app-scoped external directory to write into.
            //       // Use 'Download' instead of 'Documents' if you'd rather it land in
            //       // the device's public Downloads folder.
            //       directory: Platform.OS === 'android' ? 'Documents' : undefined,
            // });

            const file = await generatePDF({
                  html,
                  fileName: `vendor_id_card_${vendor.vendorId || vendor._id}`,
                  base64: false,
                  // Android only: which app-scoped external directory to write into.
                  // Use 'Download' instead of 'Documents' if you'd rather it land in
                  // the device's public Downloads folder.
                  directory: Platform.OS === 'android' ? 'Documents' : undefined,
            });

            if (!file.filePath) {
                  throw new Error('PDF file path was not returned.');
            }

            const fileUrl =
                  Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath;

            // Opens the native share sheet — "Save to Files" on iOS, and
            // Drive/Downloads/any installed app on Android.
            await Share.open({
                  url: fileUrl,
                  type: 'application/pdf',
                  title: 'Save or share your Vendor ID Card',
                  failOnCancel: false, // don't throw/alert if the vendor just closes the sheet
            });
      } catch (error) {
            console.error('Failed to generate/share vendor ID card PDF:', error);
            Alert.alert(
                  'Download failed',
                  'Something went wrong while generating your ID card. Please try again.',
            );
      }
}