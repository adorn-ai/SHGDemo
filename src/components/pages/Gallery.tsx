import { useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryImages = [
    {
      src: "src/assets/photoone.jpg",
      title: 'Community Gathering',
      description: 'Youth SHG Members receiving an award'
    },
    {
      src: 'src/assets/phototwo.jpg',
      title: 'Outdoor Activities',
      description: 'Youth SHG members participating in deanery games'
    },
    {
      src: 'src/assets/photothree.jpg',
      title: 'Prayer',
      description: 'Members embarking in a word of prayer'
    },
    {
      src: 'src/assets/photofour.jpg',
      title: 'Team Building',
      description: 'SHG members in a team building activity'
    },
    {
      src: 'src/assets/photofive.jpg',
      title: 'First AGM Meetup',
      description: 'SHG members taking a photo after first AGM'
    },
    {
      src: 'https://images.unsplash.com/photo-1745847768380-2caeadbb3b71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kc2hha2UlMjBidXNpbmVzcyUyMGFncmVlbWVudHxlbnwxfHx8fDE3NzAxMzQzODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Partnership Agreements',
      description: 'Signing MoUs with local businesses'
    },
  ];

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev! - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev! + 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-[#2D5016]">Our Journey in Pictures</h1>
          <p className="text-lg text-gray-600">Capturing moments of growth, unity, and success</p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
              onClick={() => setSelectedImage(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                <ImageWithFallback
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
                    <p className="text-sm text-gray-200">{image.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <Button
              onClick={() => setSelectedImage(null)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:text-gray-300 hover:bg-white/10"
            >
              <X size={32} />
            </Button>

            {/* Previous Button */}
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-16 w-16"
            >
              <ChevronLeft size={48} />
            </Button>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-16 w-16"
            >
              <ChevronRight size={48} />
            </Button>

            <div className="max-w-6xl w-full">
              <div className="relative">
                <ImageWithFallback
                  src={galleryImages[selectedImage].src}
                  alt={galleryImages[selectedImage].title}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
                <div className="mt-6 text-center text-white">
                  <h2 className="text-2xl font-semibold mb-2">
                    {galleryImages[selectedImage].title}
                  </h2>
                  <p className="text-gray-300">
                    {galleryImages[selectedImage].description}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {selectedImage + 1} / {galleryImages.length}
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