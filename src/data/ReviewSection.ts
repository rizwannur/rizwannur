
import { StaticImageData } from "next/image";
import anas from "../../public/client-image/anas-shaikh.jpg";
import philip from "../../public/client-image/philip-pellegrino.jpg";
import emil from "../../public/client-image/emil-ghelmeci.jpg";
import braeden from "../../public/client-image/braeden-moffat.png";

interface Review {
  name: string;
  role: string;
  company: string;
  profileImg: StaticImageData;
  testimonial: string;
}

export const reviewsTitle = "Testimonials";
export const reviewsDescription =
  "Real Stories from Clients and Collaborators Who Have Experienced My Work Firsthand";

export const reviews: Review[] = [
  {
    name: "Anas Shaikh",
    role: "Founder & Tech Leader",
    company: "Hexoforge LLC",
    profileImg: anas,
    testimonial:
      "Rizwan is the kind of engineer every founder hopes to find but rarely does. He has an exceptional ability to take vague, evolving ideas and turn them into well-structured, production-ready systems. During our collaboration on the Therapist SaaS and Financial CRM, he consistently demonstrated strong architectural thinking, long-term foresight, and disciplined execution. He didn't just write code—he thought deeply about product logic, scalability, and real user workflows. His technical judgment, ownership mentality, and product intuition made him a core strategic contributor rather than just a developer.",
  },
  {
    name: "Dr. Philip Pellegrino",
    role: "Licensed Psychologist",
    company: "Bethlehem Therapist",
    profileImg: philip,
    testimonial:
      "Rizwan played a critical role in shaping our digital therapist platform into something that genuinely supported clinical work. He showed a rare sensitivity to how therapists actually operate, ensuring progress notes, scheduling, and client management aligned with real-world clinical workflows. He balanced technical implementation with empathy for both providers and clients, which is not easy to do in healthcare software. His attention to detail, responsiveness to feedback, and commitment to quality were evident throughout the project.",
  },
  {
    name: "Emil Ghelmeci",
    role: "Chief Executive Officer",
    company: "Stackably LTD",
    profileImg: emil,
    testimonial:
      "Rizwan consistently delivered complex platforms with a level of strategic clarity that is uncommon at his stage. On multiple initiatives, including Therapist and CRM systems, he demonstrated strong system design skills and the ability to anticipate future needs before they became problems. He approached challenges analytically, communicated clearly, and executed with precision. His contributions went beyond development and directly elevated our overall product and business strategy.",
  },
  {
    name: "Braeden Moffat",
    role: "Chief Project Manager",
    company: "Stackably LTD",
    profileImg: braeden,
    testimonial:
      "Working with Rizwan felt like adding a force multiplier to the team. He took open-ended requirements, ambiguity, and partial specifications and transformed them into structured, reliable products. His ability to break down complex problems, take ownership, and deliver consistently made collaboration smooth and effective. Rizwan brings both technical depth and product-minded thinking, which significantly improved the quality and speed of our delivery.",
  },
];

/**
 * Validates a review object
 * @param review The review to validate
 * @returns True if the review is valid, false otherwise
 */
export function validateReview(review: Partial<Review>): review is Review {
  return (
    review.name !== undefined &&
    review.role !== undefined &&
    review.company !== undefined &&
    review.testimonial !== undefined &&
    review.profileImg !== undefined &&
    typeof review.name === "string" &&
    typeof review.role === "string" &&
    typeof review.company === "string" &&
    typeof review.testimonial === "string"
  );
}
