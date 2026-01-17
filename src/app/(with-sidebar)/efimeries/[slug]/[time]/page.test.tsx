import { notFound, redirect } from 'next/navigation';
import EfimeriesTimePage, { generateMetadata } from './page';
import { cityApi } from '@/entities/city';
import { pharmacyApi } from '@/entities/pharmacy';
import { getLocationFromCookies } from '@/features/locate-user/lib/location-cookie';

// Mock dependencies
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

jest.mock('@/entities/city', () => ({
  cityApi: {
    getCityBySlug: jest.fn(),
  },
}));

jest.mock('@/entities/pharmacy', () => ({
  pharmacyApi: {
    getCityPharmacies: jest.fn(),
  },
}));

jest.mock('@/features/locate-user/lib/location-cookie', () => ({
  getLocationFromCookies: jest.fn(),
}));

// Mock the Client Component to avoid rendering issues in Server Component tests
jest.mock('@/widgets/city-pharmacies-map', () => ({
  CityPharmaciesMap: () => <div data-testid="city-pharmacies-map" />,
}));

describe('EfimeriesTimePage', () => {
  const mockCity = {
    id: 1,
    name: 'Peiraias',
    slug: 'peiraias',
    latitude: 37.94745,
    longitude: 23.63708
  };

  const mockPharmacies = [
    { id: 1, name: 'Pharmacy A', lat: 37, lng: 23},
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Logic', () => {
    it('should redirect to base slug if time is "now"', async () => {
      const params = Promise.resolve({ slug: 'Peiraias', time: 'now' });
      (cityApi.getCityBySlug as jest.Mock).mockResolvedValue({ data: mockCity });
      (pharmacyApi.getCityPharmacies as jest.Mock).mockResolvedValue([]);
      
      await EfimeriesTimePage({ params });

      expect(redirect).toHaveBeenCalledWith('/efimeries/Peiraias');
    });

    it('should call notFound if time is invalid', async () => {
      const params = Promise.resolve({ slug: 'Peiraias', time: 'invalid-time' });
      
      await EfimeriesTimePage({ params });

      expect(notFound).toHaveBeenCalled();
    });

    it('should call notFound if city does not exist', async () => {
      const params = Promise.resolve({ slug: 'unknown-city', time: 'today' });
      (getLocationFromCookies as jest.Mock).mockResolvedValue(null);
      (cityApi.getCityBySlug as jest.Mock).mockResolvedValue({ data: null });
      (pharmacyApi.getCityPharmacies as jest.Mock).mockResolvedValue([]);

      await EfimeriesTimePage({ params });

      expect(cityApi.getCityBySlug).toHaveBeenCalledWith('unknown-city');
      expect(notFound).toHaveBeenCalled();
    });

    it('should fetch data and render map when city and time are valid', async () => {
      const params = Promise.resolve({ slug: 'Peiraias', time: 'today' });
      (getLocationFromCookies as jest.Mock).mockResolvedValue(null);
      (cityApi.getCityBySlug as jest.Mock).mockResolvedValue({ data: mockCity });
      (pharmacyApi.getCityPharmacies as jest.Mock).mockResolvedValue(mockPharmacies);

      const result = await EfimeriesTimePage({ params });

      // Verify API calls
      expect(cityApi.getCityBySlug).toHaveBeenCalledWith('Peiraias');
      expect(pharmacyApi.getCityPharmacies).toHaveBeenCalledWith(
        'Peiraias',
        'today',
        undefined,
        undefined
      );

      // Verify component return (indirectly via function execution completing without error)
      expect(result).toBeDefined();
    });

    it('should pass user location to pharmacy api if available', async () => {
      const params = Promise.resolve({ slug: 'Peiraias', time: 'tomorrow' });
      const mockLocation = { latitude: 40, longitude: 20 };
      
      (getLocationFromCookies as jest.Mock).mockResolvedValue(mockLocation);
      (cityApi.getCityBySlug as jest.Mock).mockResolvedValue({ data: mockCity });
      (pharmacyApi.getCityPharmacies as jest.Mock).mockResolvedValue(mockPharmacies);

      await EfimeriesTimePage({ params });

      expect(pharmacyApi.getCityPharmacies).toHaveBeenCalledWith(
        'Peiraias',
        'tomorrow',
        mockLocation.latitude,
        mockLocation.longitude
      );
    });
  });

  describe('generateMetadata', () => {
    it('should return 404 title if time is invalid', async () => {
      const params = Promise.resolve({ slug: 'Peiraias', time: 'invalid' });
      const metadata = await generateMetadata({ params });
      expect(metadata.title).toBe('Η σελίδα δεν βρέθηκε!');
    });

    it('should return not found metadata if city does not exist', async () => {
      const params = Promise.resolve({ slug: 'unknown', time: 'today' });
      (cityApi.getCityBySlug as jest.Mock).mockResolvedValue({ data: null });

      const metadata = await generateMetadata({ params });
      
      expect(metadata.title).toBe('Πόλη δεν βρέθηκε');
      expect(metadata.robots).toEqual({ index: false, follow: false });
    });

    it('should return correct SEO metadata for valid city and time', async () => {
      const params = Promise.resolve({ slug: 'Peiraias', time: 'today' });
      (cityApi.getCityBySlug as jest.Mock).mockResolvedValue({ data: mockCity });

      const metadata = await generateMetadata({ params });

      // We expect the title to contain the city name
      expect(metadata.title).toContain('Peiraias');
      // We expect the description to be present
      expect(metadata.description).toBeDefined();
      // Canonical URL should be set
      expect(metadata.alternates?.canonical).toContain('/efimeries/Peiraias/today');
    });
  });
});
