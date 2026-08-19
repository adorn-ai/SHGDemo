import { useEffect, useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../ui/carousel';
import { X, ChevronLeft, ChevronRight, ArrowLeft, Images } from 'lucide-react';
import { Button } from '../ui/button';

// Import local images so Vite bundles them correctly (works on Vercel)
import photoOne from '../../assets/photoone.jpg';
import photoTwo from '../../assets/phototwo.jpg';
import photoThree from '../../assets/photothree.jpg';
import photoFour from '../../assets/photofour.jpg';
import photoFive from '../../assets/photofive.jpg';

interface Photo {
  src: string;
  title: string;
  description: string;
}

interface Album {
  id: string;
  title: string;
  description: string;
  photos: Photo[];
}

// Grouped into albums rather than a flat list - each album shows a cover
// thumbnail (its first photo) and opens into its own photo set on click.
const ALBUMS: Album[] = [
  {
    id: 'agm-2026',
    title: 'AGM 2026',
    description: 'Our Annual General Meeting',
    photos: [
      {
        src: photoFive,
        title: 'First AGM Meetup',
        description: 'SHG members taking a photo after first AGM',
      },
    ],
  },
  {
    id: 'community-youth',
    title: 'Community & Youth Activities',
    description: 'Gatherings, games, and fellowship',
    photos: [
      {
        src: photoOne,
        title: 'Community Gathering',
        description: 'Youth SHG Members receiving an award',
      },
      {
        src: photoTwo,
        title: 'Outdoor Activities',
        description: 'Youth SHG members participating in deanery games',
      },
      {
        src: photoThree,
        title: 'Prayer',
        description: 'Members embarking in a word of prayer',
      },
      {
        src: photoFour,
        title: 'Team Building',
        description: 'SHG members in a team building activity',
      },
    ],
  },
  {
    id: 'partnerships',
    title: 'Partnerships',
    description: 'Agreements with local businesses',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1745847768380-2caeadbb3b71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kc2hha2UlMjBidXNpbmVzcyUyMGFncmVlbWVudHxlbnwxfHx8fDE3NzAxMzQzODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        title: 'Partnership Agreements',
        description: 'Signing MoUs with local businesses',
      },
    ],
  },
];

export function Gallery() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [mobileApi, setMobileApi] = useState<any>(null);

  // Auto-scroll the mobile carousel every 2.5s (arrows kept on this page,
  // unlike other carousels sitewide, since browsing albums/photos benefits
  // from precise manual control alongside the automatic advance).
  useEffect(() => {
    if (!mobileApi) return;
    const interval = setInterval(() => {
      mobileApi.scrollNext();
    }, 2500);
    return () => clearInterval(interval);
  }, [mobileApi]);

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setSelectedPhotoIndex(null);
  };

  const closeAlbum = () => {
    setSelectedAlbum(null);
    setSelectedPhotoIndex(null);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedAlbum) return;
    setSelectedPhotoIndex((prev) => (prev === 0 ? selectedAlbum.photos.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedAlbum) return;
    setSelectedPhotoIndex((prev) => (prev === selectedAlbum.photos.length - 1 ? 0 : prev! + 1));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedAlbum ? (
          <>
            <div className="mb-14">
              <p className="text-base tracking-[0.2em] uppercase text-[#237A17] mb-3">Gallery</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 text-[#16210E] font-bold uppercase">Our Journey in Pictures</h1>
              <p className="text-gray-600">Browse by album to see moments from each event</p>
            </div>

            {/* Mobile: auto-scrolling album carousel, 2.5s interval, arrows kept for this page */}
            <div className="md:hidden">
              <Carousel opts={{ align: 'start', loop: true, duration: 20 }} setApi={setMobileApi} className="w-full">
                <CarouselContent>
                  {ALBUMS.map((album) => (
                    <CarouselItem key={album.id} className="basis-[85%]">
                      <div className="cursor-pointer" onClick={() => openAlbum(album)}>
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                          <ImageWithFallback src={album.photos[0].src} alt={album.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-[#16210E]/80 text-[#FAF9F5] text-xs px-2 py-1 flex items-center gap-1">
                            <Images size={12} /> {album.photos.length}
                          </div>
                        </div>
                        <div className="border-t-2 border-[#6B9E4D] mt-3 pt-2">
                          <h3 className="text-[#16210E] font-bold uppercase">{album.title}</h3>
                          <p className="text-base text-gray-500">{album.description}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-3 mt-6">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              </Carousel>
            </div>

            {/* Desktop/tablet: album grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {ALBUMS.map((album) => (
                <div key={album.id} className="group cursor-pointer" onClick={() => openAlbum(album)}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={album.photos[0].src}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-3 right-3 bg-[#16210E]/80 text-[#FAF9F5] text-xs px-2 py-1 flex items-center gap-1">
                      <Images size={12} /> {album.photos.length}
                    </div>
                  </div>
                  <div className="border-t-2 border-[#6B9E4D] mt-3 pt-2">
                    <h3 className="text-[#16210E] font-bold uppercase">{album.title}</h3>
                    <p className="text-base text-gray-500">{album.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={closeAlbum}
              className="flex items-center gap-1.5 text-base text-[#16210E] hover:text-[#237A17] mb-8"
            >
              <ArrowLeft size={16} /> Back to Albums
            </button>
            <div className="mb-14">
              <p className="text-base tracking-[0.2em] uppercase text-[#237A17] mb-3">Album</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 text-[#16210E] font-bold uppercase">{selectedAlbum.title}</h1>
              <p className="text-gray-600">{selectedAlbum.description}</p>
            </div>

            {/* Mobile: auto-scrolling photo carousel within the album, arrows kept */}
            <div className="md:hidden">
              <Carousel opts={{ align: 'start', loop: true, duration: 20 }} setApi={setMobileApi} className="w-full">
                <CarouselContent>
                  {selectedAlbum.photos.map((photo, index) => (
                    <CarouselItem key={index} className="basis-[85%]">
                      <div className="cursor-pointer" onClick={() => setSelectedPhotoIndex(index)}>
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                          <ImageWithFallback src={photo.src} alt={photo.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="border-t-2 border-[#6B9E4D] mt-3 pt-2">
                          <h3 className="text-[#16210E]">{photo.title}</h3>
                          <p className="text-base text-gray-500">{photo.description}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-3 mt-6">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              </Carousel>
            </div>

            {/* Desktop/tablet: photo grid within the album */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {selectedAlbum.photos.map((photo, index) => (
                <div key={index} className="group cursor-pointer" onClick={() => setSelectedPhotoIndex(index)}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={photo.src}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="border-t-2 border-[#6B9E4D] mt-3 pt-2">
                    <h3 className="text-[#16210E]">{photo.title}</h3>
                    <p className="text-base text-gray-500">{photo.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Lightbox - scoped to the currently open album's photos */}
        {selectedAlbum && selectedPhotoIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <Button
              onClick={() => setSelectedPhotoIndex(null)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-[#FAF9F5] hover:text-gray-300 hover:bg-[#FAF9F5]/10"
            >
              <X size={32} />
            </Button>

            {selectedAlbum.photos.length > 1 && (
              <>
                <Button
                  onClick={handlePrevious}
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF9F5] hover:bg-[#FAF9F5]/10 h-16 w-16"
                >
                  <ChevronLeft size={48} />
                </Button>

                <Button
                  onClick={handleNext}
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAF9F5] hover:bg-[#FAF9F5]/10 h-16 w-16"
                >
                  <ChevronRight size={48} />
                </Button>
              </>
            )}

            <div className="max-w-6xl w-full">
              <div className="relative">
                <ImageWithFallback
                  src={selectedAlbum.photos[selectedPhotoIndex].src}
                  alt={selectedAlbum.photos[selectedPhotoIndex].title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="mt-6 text-center text-[#FAF9F5] font-sans">
                  <h2 className="text-2xl mb-2">{selectedAlbum.photos[selectedPhotoIndex].title}</h2>
                  <p className="text-gray-300">{selectedAlbum.photos[selectedPhotoIndex].description}</p>
                  <p className="text-base text-gray-400 mt-2">
                    {selectedPhotoIndex + 1} / {selectedAlbum.photos.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}