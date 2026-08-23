import { useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { X, ChevronLeft, ChevronRight, ArrowLeft, Images } from 'lucide-react';
import { Button } from '../ui/button';

// AGM 2025 photo set (14 photos). Filenames match the download bundle
// provided - drop these straight into src/assets/ as agm2025-01.jpg ... agm2025-14.jpg.
import agm25_01 from '../../assets/agm2025-01.jpg';
import agm25_02 from '../../assets/agm2025-02.jpg';
import agm25_03 from '../../assets/agm2025-03.jpg';
import agm25_04 from '../../assets/agm2025-04.jpg';
import agm25_05 from '../../assets/agm2025-05.jpg';
import agm25_06 from '../../assets/agm2025-06.jpg';
import agm25_07 from '../../assets/agm2025-07.jpg';
import agm25_08 from '../../assets/agm2025-08.jpg';
import agm25_09 from '../../assets/agm2025-09.jpg';
import agm25_10 from '../../assets/agm2025-10.jpg';
import agm25_11 from '../../assets/agm2025-11.jpg';
import agm25_12 from '../../assets/agm2025-12.jpg';
import agm25_13 from '../../assets/agm2025-13.jpg';
import agm25_14 from '../../assets/agm2025-14.jpg';

// Management Committee Handover photo set (4 photos). handover01 is the
// outdoor group photo on the church steps, used as the album thumbnail.
import handover01 from '../../assets/handover-01.jpg';
import handover02 from '../../assets/handover-02.jpg';
import handover03 from '../../assets/handover-03.jpg';
import handover04 from '../../assets/handover-04.jpg';

// 2025 Leaders Luncheon with Fr Martin Njihia photo set (4 photos).
// luncheon01 is a group photo, used as the album thumbnail.
import luncheon01 from '../../assets/luncheon-01.jpg';
import luncheon02 from '../../assets/luncheon-02.jpg';
import luncheon03 from '../../assets/luncheon-03.jpg';
import luncheon04 from '../../assets/luncheon-04.jpg';

// Feb 2026 Breakfast Forum photo set (4 photos), held under the church tent.
import breakfast01 from '../../assets/breakfast-01.jpg';
import breakfast02 from '../../assets/breakfast-02.jpg';
import breakfast03 from '../../assets/breakfast-03.jpg';
import breakfast04 from '../../assets/breakfast-04.jpg';

// AGM 2026 photo set (11 photos) - the group's 15th anniversary meeting,
// including the Strategic Plan 2026-2030 unveiling and cake cutting.
import agm26_01 from '../../assets/agm2026-01.jpg';
import agm26_02 from '../../assets/agm2026-02.jpg';
import agm26_03 from '../../assets/agm2026-03.jpg';
import agm26_04 from '../../assets/agm2026-04.jpg';
import agm26_05 from '../../assets/agm2026-05.jpg';
import agm26_06 from '../../assets/agm2026-06.jpg';
import agm26_07 from '../../assets/agm2026-07.jpg';
import agm26_08 from '../../assets/agm2026-08.jpg';
import agm26_09 from '../../assets/agm2026-09.jpg';
import agm26_10 from '../../assets/agm2026-10.jpg';
import agm26_11 from '../../assets/agm2026-11.jpg';

// March 2026 Under 40 Training photo set (3 photos).
import under40_01 from '../../assets/under40-01.jpg';
import under40_02 from '../../assets/under40-02.jpg';
import under40_03 from '../../assets/under40-03.jpg';

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
    id: 'agm-2025',
    title: 'AGM 2025',
    description: 'Highlights from our Annual General Meeting',
    photos: [
      { src: agm25_01, title: 'Committee Addresses the Floor', description: 'A committee member speaks to attendees during the proceedings.' },
      { src: agm25_02, title: 'Members in Attendance', description: 'SHG members gathered for the Annual General Meeting.' },
      { src: agm25_03, title: 'Question and Answer Session', description: 'The committee responds to questions from the floor.' },
      { src: agm25_04, title: 'Addressing the Assembly', description: 'A committee member speaks from the podium as the panel looks on.' },
      { src: agm25_05, title: 'Committee Panel', description: 'Committee members seated at the head table during discussions.' },
      { src: agm25_06, title: 'Members Following the Proceedings', description: 'Attendees listening in as the meeting continues.' },
      { src: agm25_07, title: 'Token of Appreciation', description: 'A member is presented with a token of appreciation.' },
      { src: agm25_08, title: 'Token of Appreciation', description: 'A member receives a gift from the committee.' },
      { src: agm25_09, title: 'Token of Appreciation', description: 'A member is presented with an umbrella as a token of appreciation.' },
      { src: agm25_10, title: 'Token of Appreciation', description: 'A member receives a gift bag from the committee.' },
      { src: agm25_11, title: 'Token of Appreciation', description: 'A member is presented with a gift during the meeting.' },
      { src: agm25_12, title: 'Token of Appreciation', description: 'A member receives a gift bag from the committee.' },
      { src: agm25_13, title: 'Token of Appreciation', description: 'A member is presented with a gift during the meeting.' },
      { src: agm25_14, title: 'Token of Appreciation', description: 'A committee member presents an umbrella to a longtime member.' },
    ],
  },
  {
    id: 'management-committee-handover',
    title: 'Management Committee Handover',
    description: 'Outgoing and incoming committee members mark the handover',
    photos: [
      { src: handover01, title: 'Committee Group Photo', description: 'Committee members gather outside the church following the handover.' },
      { src: handover02, title: 'Handover of Documents', description: 'An outgoing and incoming committee member exchange handover documents.' },
      { src: handover03, title: 'Reviewing the Handover', description: 'Committee members go through handover documentation together.' },
      { src: handover04, title: 'Handover of Records', description: 'A committee member hands over records as part of the transition.' },
    ],
  },
  {
    id: 'leaders-luncheon-2025',
    title: '2025 Leaders Luncheon',
    description: 'A luncheon with Fr Martin Njihia',
    photos: [
      { src: luncheon01, title: 'Group Photo', description: 'Leaders gather for a group photo at the 2025 Leaders Luncheon with Fr Martin Njihia.' },
      { src: luncheon02, title: 'Fr Martin Njihia Addresses the Leaders', description: 'Fr Martin Njihia speaks to the gathered leaders during the luncheon.' },
      { src: luncheon03, title: 'Leaders in Discussion', description: 'Leaders listen in as the discussion continues around the table.' },
      { src: luncheon04, title: 'Group Photo', description: 'A second group photo from the 2025 Leaders Luncheon.' },
    ],
  },
  {
    id: 'breakfast-forum-2026',
    title: 'Feb 2026 Breakfast Forum',
    description: 'Members gather for a morning discussion forum',
    photos: [
      { src: breakfast01, title: 'Forum Discussion', description: 'A facilitator addresses members gathered under the tent for the breakfast forum.' },
      { src: breakfast02, title: 'Forum Discussion', description: 'Members listen as the discussion continues under the tent.' },
      { src: breakfast03, title: 'Forum Discussion', description: 'A facilitator speaks to members seated around the table.' },
      { src: breakfast04, title: 'Members in Attendance', description: 'Members gathered under the tent for the breakfast forum.' },
    ],
  },
  {
    id: 'agm-2026',
    title: 'AGM 2026',
    description: "Our 15th anniversary Annual General Meeting",
    photos: [
      { src: agm26_07, title: 'Strategic Plan 2026-2030', description: 'A close-up of the newly unveiled Strategic Plan 2026-2030.' },
      { src: agm26_05, title: 'Unveiling the Strategic Plan', description: 'Leaders unveil the Strategic Plan 2026-2030.' },
      { src: agm26_02, title: 'Token of Appreciation', description: 'A member is presented with a token of appreciation.' },
      { src: agm26_03, title: 'Token of Appreciation', description: 'A member receives a gift bag from the committee.' },
      { src: agm26_04, title: 'Token of Appreciation', description: 'A member is presented with a gift during the meeting.' },
      { src: agm26_01, title: 'Members Gathered', description: 'SHG members gathered for the Annual General Meeting.' },
      { src: agm26_06, title: 'Strategic Plan 2026-2030 Unveiled', description: 'Members applaud as the Strategic Plan 2026-2030 is unveiled.' },
      { src: agm26_08, title: 'Cutting the Anniversary Cake', description: 'Leaders cut the cake marking 15 years of the SHG.' },
      { src: agm26_09, title: 'Celebrating 15 Years', description: 'Members share a slice of cake to mark 15 years of growing together.' },
      { src: agm26_10, title: 'Celebrating 15 Years', description: 'Members share a slice of cake to mark 15 years of growing together.' },
      { src: agm26_11, title: 'Anniversary Celebrations', description: 'Members gather around the cake table to celebrate the anniversary.' },
    ],
  },
  {
    id: 'under-40-training-2026',
    title: 'March 2026 Under 40 Training',
    description: 'A financial literacy training session for under-40 members',
    photos: [
      { src: under40_01, title: 'Group Photo', description: 'Participants gather for a group photo at the Under 40 Training.' },
      { src: under40_02, title: 'Group Photo', description: 'Another moment from the group photo at the training.' },
      { src: under40_03, title: 'Training Session', description: 'Participants attend a session during the training.' },
    ],
  },
];

export function Gallery() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

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
              <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 text-[#16210E] font-bold uppercase">Our Journey in Pictures</h1>
              <p className="text-gray-600">Browse by album to see moments from each event</p>
            </div>

            {/* Album grid - one column on mobile (scrolls down normally), up to
                3 columns on larger screens. No carousel on any breakpoint. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 text-[#16210E] font-bold uppercase">{selectedAlbum.title}</h1>
              <p className="text-gray-600">{selectedAlbum.description}</p>
            </div>

            {/* Photo grid within the album - one column on mobile (scrolls
                down normally), up to 3 columns on larger screens. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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