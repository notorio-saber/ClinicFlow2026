import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MedicalRecordFormData } from "@/types";

const productSchema = z.object({
  name: z.string().min(1, "Nome do produto obrigatório"),
  batch: z.string().min(1, "Lote obrigatório"),
  dosage: z.string().min(1, "Dosagem obrigatória"),
});

const recordSchema = z.object({
  procedureType: z.string().min(1, "Selecione o tipo de procedimento"),
  chiefComplaint: z.string().min(1, "Queixa principal obrigatória"),
  professionalAssessment: z.string().min(1, "Avaliação profissional obrigatória"),
  procedureDetails: z.string().min(1, "Detalhes do procedimento obrigatórios"),
  productsUsed: z.array(productSchema).optional(),
  treatedAreas: z.array(z.string()).optional(),
  postCareInstructions: z.string().min(1, "Cuidados pós-procedimento obrigatórios"),
  additionalNotes: z.string().optional(),
});

const PROCEDURE_TYPES = [
  "Toxina Botulínica",
  "Preenchimento Labial",
  "Preenchimento Facial",
  "Bioestimulador de Colágeno",
  "Harmonização Facial",
  "Skinbooster",
  "Fios de PDO",
  "Peeling Químico",
  "Microagulhamento",
  "Limpeza de Pele",
  "Laser",
  "Outro",
];

const TREATED_AREAS = [
  "Testa",
  "Glabela",
  "Pés de galinha",
  "Nariz",
  "Lábios",
  "Bigode chinês",
  "Marionete",
  "Malar",
  "Mandíbula",
  "Mento/Queixo",
  "Pescoço",
  "Colo",
  "Mãos",
];

interface MedicalRecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MedicalRecordFormData) => Promise<void>;
}

export function MedicalRecordFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: MedicalRecordFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      procedureType: "",
      chiefComplaint: "",
      professionalAssessment: "",
      procedureDetails: "",
      productsUsed: [],
      treatedAreas: [],
      postCareInstructions: "",
      additionalNotes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productsUsed",
  });

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async (data: MedicalRecordFormData) => {
    try {
      setLoading(true);
      await onSubmit({
        ...data,
        treatedAreas: selectedAreas,
      });
      form.reset();
      setSelectedAreas([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving record:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Novo Prontuário</DialogTitle>
          <DialogDescription>
            Registre os detalhes do procedimento realizado
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Procedure Type */}
              <FormField
                control={form.control}
                name="procedureType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Procedimento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROCEDURE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Chief Complaint */}
              <FormField
                control={form.control}
                name="chiefComplaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Queixa Principal</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a queixa/desejo do paciente..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Professional Assessment */}
              <FormField
                control={form.control}
                name="professionalAssessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avaliação Profissional</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Sua avaliação técnica..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Treated Areas */}
              <div className="space-y-2">
                <FormLabel>Áreas Tratadas</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {TREATED_AREAS.map((area) => (
                    <Button
                      key={area}
                      type="button"
                      variant={selectedAreas.includes(area) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleArea(area)}
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Procedure Details */}
              <FormField
                control={form.control}
                name="procedureDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalhes do Procedimento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Técnica utilizada, pontos de aplicação..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Products Used */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Produtos Utilizados</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", batch: "", dosage: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-2 p-3 rounded-lg border border-border"
                  >
                    <div className="col-span-5">
                      <Input
                        placeholder="Produto"
                        {...form.register(`productsUsed.${index}.name`)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Lote"
                        {...form.register(`productsUsed.${index}.batch`)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Dose"
                        {...form.register(`productsUsed.${index}.dosage`)}
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Post Care Instructions */}
              <FormField
                control={form.control}
                name="postCareInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuidados Pós-Procedimento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Orientações de cuidados..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Notes */}
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Adicionais (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Outras observações..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Prontuário
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
