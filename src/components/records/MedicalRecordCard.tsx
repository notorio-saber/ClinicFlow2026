import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Syringe,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { MedicalRecord } from "@/types";

interface MedicalRecordCardProps {
  record: MedicalRecord;
}

export function MedicalRecordCard({ record }: MedicalRecordCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">
                      {record.procedureType}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(record.createdAt)}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Preview - areas treated */}
            {record.treatedAreas && record.treatedAreas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {record.treatedAreas.slice(0, 3).map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
                {record.treatedAreas.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{record.treatedAreas.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <Separator />

            {/* Chief Complaint */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <Stethoscope className="h-4 w-4" />
                Queixa Principal
              </div>
              <p className="text-sm">{record.chiefComplaint}</p>
            </div>

            {/* Professional Assessment */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                Avaliação Profissional
              </div>
              <p className="text-sm">{record.professionalAssessment}</p>
            </div>

            {/* Treated Areas */}
            {record.treatedAreas && record.treatedAreas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  Áreas Tratadas
                </div>
                <div className="flex flex-wrap gap-1">
                  {record.treatedAreas.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Procedure Details */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Detalhes do Procedimento
              </div>
              <p className="text-sm">{record.procedureDetails}</p>
            </div>

            {/* Products Used */}
            {record.productsUsed && record.productsUsed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Syringe className="h-4 w-4" />
                  Produtos Utilizados
                </div>
                <div className="space-y-2">
                  {record.productsUsed.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                    >
                      <span className="font-medium">{product.name}</span>
                      <div className="flex gap-3 text-muted-foreground">
                        <span>Lote: {product.batch}</span>
                        <span>Dose: {product.dosage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Care Instructions */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Cuidados Pós-Procedimento
              </div>
              <p className="text-sm">{record.postCareInstructions}</p>
            </div>

            {/* Additional Notes */}
            {record.additionalNotes && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Observações Adicionais
                </div>
                <p className="text-sm">{record.additionalNotes}</p>
              </div>
            )}

            {/* Revision History */}
            {record.revisionHistory && record.revisionHistory.length > 0 && (
              <div>
                <Separator className="my-2" />
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Histórico de Revisões
                </div>
                <div className="space-y-1">
                  {record.revisionHistory.map((revision) => (
                    <div
                      key={revision.id}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDate(revision.timestamp)} - {revision.userName}:{" "}
                      {revision.changes}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
