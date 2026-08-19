import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Download, FileText, Image, X } from 'lucide-react';
import { useState } from 'react';

interface DocumentViewerProps {
  member: {
    firstName: string;
    lastName: string;
    documents?: {
      passportPhoto?: string;
      passportPhotoName?: string;
      nationalIdCopy?: string;
      nationalIdCopyName?: string;
      kraCertificate?: string;
      kraCertificateName?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewer({ member, isOpen, onClose }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<'passport' | 'id' | 'kra' | null>(null);

  if (!member.documents) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Documents - {member.firstName} {member.lastName}</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center text-gray-500">
            <FileText className="mx-auto mb-4" size={48} />
            <p>No documents uploaded for this member</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { passportPhoto, passportPhotoName, nationalIdCopy, nationalIdCopyName, kraCertificate, kraCertificateName } = member.documents;

  const downloadDocument = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    link.click();
  };

  const isPDF = (base64?: string) => {
    return base64?.startsWith('data:application/pdf');
  };

  const renderDocument = () => {
    let doc: string | undefined;
    let name: string | undefined;

    if (selectedDoc === 'passport') {
      doc = passportPhoto;
      name = passportPhotoName;
    } else if (selectedDoc === 'id') {
      doc = nationalIdCopy;
      name = nationalIdCopyName;
    } else if (selectedDoc === 'kra') {
      doc = kraCertificate;
      name = kraCertificateName;
    }

    if (!doc) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">{name}</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadDocument(doc!, name || 'document')}
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDoc(null)}
              >
                <X size={20} />
              </Button>
            </div>
          </div>
          <div className="p-4 max-h-[80vh] overflow-auto">
            {isPDF(doc) ? (
              <iframe
                src={doc}
                className="w-full h-[70vh] border-0"
                title={name}
              />
            ) : (
              <img
                src={doc}
                alt={name}
                className="max-w-full h-auto mx-auto"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Documents - {member.firstName} {member.lastName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {/* Passport Photo */}
            {passportPhoto && (
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Image className="text-blue-600" size={24} />
                  <div>
                    <p className="font-medium">Passport Photo</p>
                    <p className="text-sm text-gray-500">{passportPhotoName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDoc('passport')}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDocument(passportPhoto, passportPhotoName || 'passport-photo')}
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* National ID Copy */}
            {nationalIdCopy && (
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="text-green-600" size={24} />
                  <div>
                    <p className="font-medium">National ID Copy</p>
                    <p className="text-sm text-gray-500">{nationalIdCopyName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDoc('id')}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDocument(nationalIdCopy, nationalIdCopyName || 'national-id')}
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* KRA Certificate */}
            {kraCertificate && (
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="text-purple-600" size={24} />
                  <div>
                    <p className="font-medium">KRA Tax Pin Certificate</p>
                    <p className="text-sm text-gray-500">{kraCertificateName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDoc('kra')}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDocument(kraCertificate, kraCertificateName || 'kra-certificate')}
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            )}

            {!passportPhoto && !nationalIdCopy && !kraCertificate && (
              <div className="p-8 text-center text-gray-500">
                <FileText className="mx-auto mb-4" size={48} />
                <p>No documents uploaded</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedDoc && renderDocument()}
    </>
  );
}