import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactForm {
  nombre: string;
  email: string;
  mensaje: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactForm;
    const { nombre, email, mensaje } = body;

    // Validaciones
    if (!nombre || !email || !mensaje) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Enviar email a noldenluxury@gmail.com
    const response = await resend.emails.send({
      from: "contacto@noldenluxury.com",
      to: "noldenluxury@gmail.com",
      replyTo: email,
      subject: `Nuevo usuario de contacto: ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #fcd34d; padding-bottom: 10px;">
            Nuevo Mensaje de Contacto
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0;">
              <strong style="color: #fcd34d;">Nombre:</strong> ${nombre}
            </p>
            <p style="margin: 0 0 15px 0;">
              <strong style="color: #fcd34d;">Email:</strong> 
              <a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">
                ${email}
              </a>
            </p>
            <p style="margin: 0;">
              <strong style="color: #fcd34d;">Mensaje:</strong>
            </p>
            <pre style="background-color: #white; padding: 15px; border-left: 4px solid #fcd34d; margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">
${mensaje}
            </pre>
          </div>

          <div style="background-color: #1a1a1a; color: #fcd34d; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 12px;">
              Nolden Luxury · El brillo de un legado
            </p>
          </div>
        </div>
      `,
    });

    if (response.error) {
      return NextResponse.json(
        { error: "Error al enviar el email" },
        { status: 500 }
      );
    }

    // Enviar email de confirmación al cliente
    await resend.emails.send({
      from: "contacto@noldenluxury.com",
      to: email,
      subject: "Hemos recibido tu mensaje - Nolden Luxury",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fcd34d; text-align: center; margin-bottom: 30px;">
            NOLDEN LUXURY
          </h2>
          
          <p style="color: #1a1a1a; font-size: 16px;">
            Hola <strong>${nombre}</strong>,
          </p>

          <p style="color: #1a1a1a; line-height: 1.6; margin: 20px 0;">
            Agradecemos tu interés en Nolden Luxury. Hemos recibido tu mensaje y nos pondremos en contacto contigo 
            en la brevedad posible para ayudarte con tu solicitud.
          </p>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>Detalles de tu solicitud:</strong>
            </p>
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
              <strong>Email de contacto:</strong> ${email}
            </p>
          </div>

          <p style="color: #1a1a1a; line-height: 1.6; margin: 20px 0;">
            Si tienes alguna pregunta adicional, no dudes en responder a este email.
          </p>

          <p style="color: #1a1a1a; margin-top: 30px;">
            Saludos cordiales,<br/>
            <strong>El equipo de Nolden Luxury</strong>
          </p>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">
              Nolden Luxury · El brillo de un legado
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Mensaje enviado correctamente",
    });
  } catch (error) {
    console.error("Error en API de contacto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
