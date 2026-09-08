export interface Vendor {
      documents: VendorDocuments;
      availability: VendorAvailability;
      _id: string;
      name: string;
      email: string;
      phone: string;
      alternatePhone: string;
      gender: string;
      role: string;
      businessName: string;
      businessType: string;
      registrationNumber: string;
      gstNumber: string;
      services: string[];
      qualifications: string[];
      experience: number;
      specialization: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      longitude: number;
      latitude: number;
      serviceAreas: string[];
      isVerified: boolean;
      isActive: boolean;
      isPhoneVerified: boolean;
      verificationStatus: string;
      rating: number;
      totalReviews: number;
      profileImage: string | null;
      bio: string;
      referredBy: string;
      referredByRef: string | null;
      referredByModel: string | null;
      ambassadorId: string | null;
      isAmbassadorCredited: boolean;
      createdAt: string;
      updatedAt: string;
      referralCode: string;
      vendorId: string;
      __v: number;
      verificationDate: string;
}
export interface VendorDocuments {
      identityProof: VendorDocument;
      qualificationCertificate: VendorDocument;
      businessLicense: VendorDocument;
      insuranceCertificate: VendorDocument;
      policeVerification: VendorDocument;
}
export interface VendorDocument {
      type: string;
      status: string;
      rejectionReason: string;
}
export interface VendorAvailability {
      days: string[];
      emergencyAvailable: boolean;
      timeSlots: string[];
}
export interface VendorSetting {
      title: string;
      logoUrl: string | null;
      signatureUrl: string | null;
}

export interface VendorResponse {
      success: boolean;
      data: {
            vendor: Vendor;
            setting: VendorSetting;
      };
}